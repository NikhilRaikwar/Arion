"use client";

import React from "react";

interface FormattedMessageProps {
  content: string;
}

/**
 * FormattedMessage Component
 * 
 * Renders AI assistant responses with:
 * - Clickable markdown links: [text](url)
 * - Viewable images for image links
 * - Clickable raw URLs
 * - Preserved whitespace and formatting
 * 
 * Used across all chat interfaces (ChatWidget, AIAssistant, temp-chat)
 */
export function FormattedMessage({ content }: FormattedMessageProps) {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  
  // Combined pattern to match markdown links/images and raw URLs
  // Matches: ![alt](url) or [text](url) or just http://url or https://url
  const combinedPattern = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;
  
  let match;
  while ((match = combinedPattern.exec(content)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(content.substring(currentIndex, match.index));
    }
    
    if (match[1] !== undefined && match[2]) {
      // Markdown image: ![alt](url) - Always render as image
      const altText = match[1] || 'NFT Image';
      const url = match[2];
      
      parts.push(
        <div key={`img-${match.index}`} className="my-3">
          <img
            src={url}
            alt={altText}
            className="rounded-lg max-w-full h-auto border border-gray-300 shadow-sm cursor-pointer hover:opacity-90 hover:shadow-md transition-all duration-200"
            style={{ maxHeight: '400px', maxWidth: '100%' }}
            onClick={() => window.open(url, '_blank')}
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallbackLink = document.createElement('a');
              fallbackLink.href = url;
              fallbackLink.target = '_blank';
              fallbackLink.rel = 'noopener noreferrer';
              fallbackLink.className = 'text-blue-600 hover:text-blue-800 underline break-all font-medium';
              fallbackLink.textContent = altText;
              target.parentNode?.insertBefore(fallbackLink, target);
            }}
          />
        </div>
      );
    } else if (match[3] && match[4]) {
      // Markdown link: [text](url)
      const linkText = match[3];
      const url = match[4];
      
      // Check if it's an image link (Image, Thumbnail, Full Image, NFT, View Image, etc.)
      const isImage = /^(thumbnail|full image|image|nft|view image|view|picture|photo|🖼️|view nft)$/i.test(linkText.trim());
      
      if (isImage) {
        // Render as viewable image
        parts.push(
          <div key={`img-${match.index}`} className="my-3">
            <img
              src={url}
              alt={linkText}
              className="rounded-lg max-w-full h-auto border border-gray-300 shadow-sm cursor-pointer hover:opacity-90 hover:shadow-md transition-all duration-200"
              style={{ maxHeight: '400px', maxWidth: '100%' }}
              onClick={() => window.open(url, '_blank')}
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallbackLink = document.createElement('a');
                fallbackLink.href = url;
                fallbackLink.target = '_blank';
                fallbackLink.rel = 'noopener noreferrer';
                fallbackLink.className = 'text-blue-600 hover:text-blue-800 underline break-all font-medium';
                fallbackLink.textContent = linkText;
                target.parentNode?.insertBefore(fallbackLink, target);
              }}
            />
          </div>
        );
      } else {
        // Render as clickable link
        parts.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all font-medium transition-colors duration-150"
          >
            {linkText}
          </a>
        );
      }
    } else if (match[5]) {
      // Raw URL (not in markdown format)
      const url = match[5];
      
      // Check if URL appears to be an image (ends with image extensions)
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
      const isImageUrl = imageExtensions.test(url);
      
      if (isImageUrl) {
        // Render as viewable image
        parts.push(
          <div key={`img-${match.index}`} className="my-3">
            <img
              src={url}
              alt="Image"
              className="rounded-lg max-w-full h-auto border border-gray-300 shadow-sm cursor-pointer hover:opacity-90 hover:shadow-md transition-all duration-200"
              style={{ maxHeight: '400px', maxWidth: '100%' }}
              onClick={() => window.open(url, '_blank')}
              onError={(e) => {
                // Fallback to link if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallbackLink = document.createElement('a');
                fallbackLink.href = url;
                fallbackLink.target = '_blank';
                fallbackLink.rel = 'noopener noreferrer';
                fallbackLink.className = 'text-blue-600 hover:text-blue-800 underline break-all';
                fallbackLink.textContent = url;
                target.parentNode?.insertBefore(fallbackLink, target);
              }}
            />
          </div>
        );
      } else {
        // Render as clickable link
        parts.push(
          <a
            key={`url-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all transition-colors duration-150"
          >
            {url}
          </a>
        );
      }
    }
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last match
  if (currentIndex < content.length) {
    parts.push(content.substring(currentIndex));
  }
  
  // Return formatted content or original if no matches found
  return <>{parts.length > 0 ? parts : content}</>;
}
