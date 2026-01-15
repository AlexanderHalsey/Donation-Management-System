import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import * as acceptLanguage from 'accept-language-parser'
import { Language } from '@/domain/types'

/**
 * Parameter decorator that automatically parses the Accept-Language header
 * and injects the parsed language into the method parameter.
 *
 * Returns 'fr' if French is found in Accept-Language header, 'en' otherwise.
 *
 * Usage:
 * @Get('export')
 * async exportData(@ParsedLanguage() language: Language) {
 *   // language will be 'fr' or 'en'
 * }
 */
export const ParsedLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Language => {
    const request = ctx.switchToHttp().getRequest()
    const acceptLanguageHeader = request.headers['accept-language']

    if (!acceptLanguageHeader) return 'en'

    try {
      const languages = acceptLanguage.parse(acceptLanguageHeader)

      // Check if French is preferred, otherwise default to English
      for (const lang of languages) {
        if (lang.code === 'fr') {
          return 'fr'
        }
      }
    } catch (error) {
      // Fallback to English if parsing fails
      console.warn('Failed to parse Accept-Language header:', error)
    }

    return 'en'
  },
)
