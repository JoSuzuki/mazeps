import LinkButton from '~/components/link-button/link-button.component'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

interface PageItem {
  page: number | '...'
  isEllipsis: boolean
  isCurrent: boolean
}

const Pagination = ({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps): React.ReactNode => {
  const generatePageUrl = (page: number): string => {
    const url = new URL(baseUrl, window.location.origin)
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })
    url.searchParams.set('page', page.toString())

    return url.pathname + url.search
  }

  // Generate array of page items to display
  const generatePageItems = (): PageItem[] => {
    // If 5 or fewer pages, show all pages
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => ({
        page: i + 1,
        isEllipsis: false,
        isCurrent: i + 1 === currentPage,
      }))
    }

    const isFirstPage = currentPage === 1
    const isLastPage = currentPage === totalPages
    const isFirstTwoPages = currentPage <= 2
    const isFirstThreePages = currentPage <= 3
    const isLastTwoPages = currentPage >= totalPages - 1
    const isLastThreePages = currentPage >= totalPages - 2

    return [
      !isFirstPage && {
        page: 1,
        isEllipsis: false,
        isCurrent: currentPage === 1,
      },
      !isFirstThreePages && {
        page: '...' as const,
        isEllipsis: true,
        isCurrent: false,
      },
      !isFirstTwoPages && {
        page: currentPage - 1,
        isEllipsis: false,
        isCurrent: false,
      },
      {
        page: currentPage,
        isEllipsis: false,
        isCurrent: true,
      },
      !isLastTwoPages && {
        page: currentPage + 1,
        isEllipsis: false,
        isCurrent: false,
      },
      !isLastThreePages && {
        page: '...' as const,
        isEllipsis: true,
        isCurrent: false,
      },
      !isLastPage && {
        page: totalPages,
        isEllipsis: false,
        isCurrent: currentPage === totalPages,
      },
    ].filter(Boolean) as PageItem[]
  }

  const pageItems = generatePageItems()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      {pageItems.map((item, index) => {
        if (item.isEllipsis) {
          return (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          )
        }

        const page = item.page as number
        return (
          <LinkButton
            key={page}
            to={generatePageUrl(page)}
            styleType={item.isCurrent ? 'primary' : 'secondary'}
            className={item.isCurrent ? 'font-bold' : ''}
          >
            {page}
          </LinkButton>
        )
      })}
    </div>
  )
}

export default Pagination
