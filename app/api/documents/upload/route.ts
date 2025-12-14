import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getOpenAIClient } from '@/lib/api/openai'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('user_id') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and user_id are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `${userId}/${timestamp}-${file.name}`

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filename)

    // Extract text based on file type
    let extractedText = ''

    if (file.type === 'text/plain') {
      // Plain text - just read it
      extractedText = buffer.toString('utf-8')
    } else if (file.type === 'application/pdf') {
      // For PDFs, we'll use a simplified approach (you may want to add pdf-parse library)
      // For now, we'll indicate PDF processing is limited
      extractedText = `[PDF Document: ${file.name}]\n\nNote: Full PDF text extraction requires additional processing. Please install pdf-parse library for complete extraction.`
    } else {
      // For DOC/DOCX files
      extractedText = `[Document: ${file.name}]\n\nNote: Full document text extraction requires additional processing. Please install mammoth library for complete extraction.`
    }

    // Use OpenAI to analyze the document
    const openai = getOpenAIClient()

    const analysisPrompt = `Analyze the following document and provide:
1. A concise summary (2-3 sentences)
2. A list of 5-7 key points

Document:
${extractedText.substring(0, 4000)} ${extractedText.length > 4000 ? '...(truncated)' : ''}

Return your response in this exact JSON format:
{
  "summary": "Your 2-3 sentence summary here",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a document analysis assistant. Analyze documents and extract summaries and key points. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'

    let analysis
    try {
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      analysis = {
        summary: 'Analysis unavailable. Please try again.',
        keyPoints: ['Unable to extract key points']
      }
    }

    // Save to database
    const { error: dbError } = await supabase
      .from('uploaded_documents')
      .insert({
        user_id: userId,
        filename: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        summary: analysis.summary,
        key_points: analysis.keyPoints,
        extracted_text: extractedText.substring(0, 10000), // Store first 10k chars
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't fail the request if DB save fails - the file is already uploaded
    }

    return NextResponse.json({
      success: true,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      fileUrl: publicUrl
    })

  } catch (error: any) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process document' },
      { status: 500 }
    )
  }
}
