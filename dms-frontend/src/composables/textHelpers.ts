import slugify from 'slugify'

export function useTextHelpers(): {
  isSearchMatch: (needle: string, ...haystack: (string | undefined)[]) => boolean
} {
  return {
    isSearchMatch: (needle: string, ...haystack: (string | undefined)[]): boolean => {
      const needleTokens = needle
        .split(' ')
        .map((token) => token.trim())
        .filter((token) => token)
        .map((token) => slugify(token, { lower: true }))
      const haystackToken = haystack
        .filter((token): token is string => !!token)
        .map((token) => slugify(token, { lower: true }))
        .join(' ')
      return needleTokens.every((needleToken) => haystackToken.includes(needleToken))
    },
  }
}
