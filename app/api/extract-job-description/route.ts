import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are supported' },
        { status: 400 }
      )
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch webpage: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove script and style elements
    $('script, style, nav, footer, header, aside, .ad, .advertisement, .social, .share').remove()

    // Common selectors for job descriptions on various job boards
    const jobDescriptionSelectors = [
      // LinkedIn
      '[data-automation-id="jobPostingDescription"]',
      '.description__text',
      '.show-more-less-html__markup',
      '.jobs-description-content__text',
      
      // Indeed
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',
      
      // Generic job boards
      '.job-description',
      '.job-description-text',
      '.job-details',
      '.job-content',
      '[class*="job"][class*="description"]',
      '[class*="job"][class*="detail"]',
      '[id*="job"][id*="description"]',
      '[id*="job"][id*="detail"]',
      
      // Generic content areas (fallback)
      'main article',
      'main .content',
      '[role="main"] article',
      '[role="main"] .content',
    ]

    let jobDescription = ''

    // Try each selector until we find content
    for (const selector of jobDescriptionSelectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        const text = element.text().trim()
        // Make sure we got substantial content (at least 100 characters)
        if (text.length > 100) {
          jobDescription = text
          break
        }
      }
    }

    // Fallback: try to find the largest text block in main content
    if (!jobDescription || jobDescription.length < 100) {
      const main = $('main, [role="main"], .main-content, #main-content').first()
      if (main.length > 0) {
        // Get all paragraph and list items
        const paragraphs = main.find('p, li, div').map((_, el) => $(el).text().trim()).get()
        const longParagraphs = paragraphs.filter(p => p.length > 50)
        
        if (longParagraphs.length > 0) {
          jobDescription = longParagraphs.join('\n\n')
        } else {
          // Last resort: get all text from main
          jobDescription = main.text().trim()
        }
      }
    }

    // Clean up the extracted text
    jobDescription = jobDescription
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim()

    // Validate that we extracted meaningful content
    if (!jobDescription || jobDescription.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract a valid job description from this page. Please try pasting the text directly, or check if the URL is correct.' },
        { status: 400 }
      )
    }

    // If content is too long, truncate with a note (but this is unlikely for job descriptions)
    if (jobDescription.length > 50000) {
      jobDescription = jobDescription.substring(0, 50000) + '\n\n[Content truncated due to length]'
    }

    return NextResponse.json({
      jobDescription,
      success: true,
    })
  } catch (error: any) {
    console.error('Error extracting job description:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to extract job description. Please try pasting the text directly.' },
      { status: 500 }
    )
  }
}

