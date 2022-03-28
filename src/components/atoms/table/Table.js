import React, { useCallback, useMemo } from 'react'
import styled, { css, useTheme } from 'styled-components'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { RiSortDesc } from 'react-icons/ri'
import { VARIANT } from '../../../theme/theme'
import { ButtonIcon } from '../buttonIcon/ButtonIcon'
import Text from '../text/Text'

const StyledTable = styled.table`
  display: table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0px;

  ${({ theme }) => {
    const { style, width, color, radius } = theme?.components?.table?.border ?? {}

    return css`
      border-style: ${style};
      border-width: ${width};
      border-color: ${color};
      border-radius: ${radius};
    `
  }};

  ${({ minWidth }) =>
    minWidth &&
    css`
      min-width: ${() => `${minWidth}px`};
    `}
`

const Table = ({ children, ...props }) => <StyledTable {...props}>{children}</StyledTable>

const StyledTHead = styled.thead`
  display: table-header-group;
`

const TableHead = ({ children, ...props }) => (
  <StyledTHead {...props}>
    {React.Children.map(children, (child) => child && React.cloneElement(child, { isTableHead: true }))}
  </StyledTHead>
)

const StyledTableBody = styled.tbody`
  display: table-row-group;
`

const TableBody = ({ children, ...props }) => <StyledTableBody {...props}>{children}</StyledTableBody>

const StyledTableRow = styled.tr`
  color: inherit;
  display: table-row;
  vertical-align: middle;
  outline: 0px;
`

const TableRow = ({ children, isTableHead, ...props }) => (
  <StyledTableRow {...props}>
    {React.Children.map(children, (child) => child && React.cloneElement(child, { isTableHead }))}
  </StyledTableRow>
)

TableRow.defaultProps = {
  isTableHead: false,
}

const StyledTableCell = styled.td`
  display: table-cell;
  vertical-align: inherit;
  text-align: ${({ align }) => `${align}`};
  padding: ${({ theme }) => `${theme?.components?.table?.cell?.padding}`};

  ${({ theme }) => {
    const { style, rightWidth, bottomWidth, color } = theme?.components?.table?.cell?.border ?? {}

    return css`
      border-style: ${style};
      border-left-width: 0;
      border-top-width: 0;
      border-right-width: ${rightWidth};
      border-bottom-width: ${bottomWidth};
      border-color: ${color};

      &:last-of-type {
        border-right: 0;
      }
    `
  }};

  tbody tr:last-of-type & {
    border-bottom-width: 0;
  }
`

const StyledTableHeaderCell = styled.th`
  display: table-cell;
  vertical-align: inherit;
  text-align: ${({ align }) => `${align}`};
  padding: ${({ theme }) => `${theme?.components?.table?.cell?.padding}`};
  background-color: ${({ theme }) => `${theme?.components?.table?.head?.backgroundColor}`};

  ${({ theme }) => {
    const { style, rightWidth, bottomWidth, color } = theme?.components?.table?.cell?.border ?? {}

    return css`
      border-style: ${style};
      border-left-width: 0;
      border-top-width: 0;
      border-right-width: ${rightWidth};
      border-bottom-width: ${bottomWidth};
      border-color: ${color};

      &:last-of-type {
        border-right: 0;
      }
    `
  }};
`

const TableCell = ({ children, isTableHead, ...props }) => {
  const Component = isTableHead ? StyledTableHeaderCell : StyledTableCell
  return (
    <Component isTableHead={isTableHead} {...props}>
      {children}
    </Component>
  )
}

TableCell.defaultProps = {
  align: 'left',
  isTableHead: false,
}

const StyledTablePagination = styled.div`
  width: 100%;
  padding: ${({ theme }) => `${theme?.components?.table?.cell?.padding}`};
  padding-right: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const NavigationWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 12px;
  gap: 6px;
`

const TablePagination = ({ count, rowsPerPage, page, onPageChange, variant, ...props }) => {
  const theme = useTheme()

  const handleOnNextPageClick = useCallback(() => {
    onPageChange?.(page + 1)
  }, [page, onPageChange])

  const handleOnPrevPageClick = useCallback(() => {
    onPageChange?.(page - 1)
  }, [page, onPageChange])

  const numberOfPages = useMemo(() => Math.ceil(count / rowsPerPage), [count, rowsPerPage])

  const isNextPageDisabled = useMemo(() => page === numberOfPages - 1, [page, numberOfPages])

  const isPrevPageDisabled = useMemo(() => page === 0, [page])

  const paginationInfo = useMemo(() => {
    let currentPageLastElement = 1 * (page + 1) * rowsPerPage
    const currentPageFirstElement = currentPageLastElement - rowsPerPage

    if (currentPageLastElement > count) {
      currentPageLastElement = count
    }
    return `${currentPageFirstElement}-${currentPageLastElement} of ${count}`
  }, [count, rowsPerPage, page])

  return (
    <StyledTablePagination {...props}>
      <Text variant={variant}>{paginationInfo}</Text>
      <NavigationWrapper>
        <ButtonIcon
          icon={<FiChevronLeft size="24px" color={theme?.colors[variant]?.main} />}
          onClick={handleOnPrevPageClick}
          disabled={isPrevPageDisabled}
          tabIndex={-1}
          aria-label="Go to previous page"
          title="Go to previous page"
        />

        <ButtonIcon
          icon={<FiChevronRight size="24px" color={theme?.colors[variant]?.main} />}
          onClick={handleOnNextPageClick}
          disabled={isNextPageDisabled}
          tabIndex={0}
          aria-label="Go to next page"
          title="Go to next page"
        />
      </NavigationWrapper>
    </StyledTablePagination>
  )
}

TablePagination.defaultProps = {
  variant: VARIANT.NTRL_DARK,
}

const IconWrapper = styled.span`
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${({ isActive }) => (isActive ? 1 : 0)};
  margin-right: ${({ align }) => (align === 'left' ? 0 : '6px')};
  margin-left: ${({ align }) => (align === 'left' ? '6px' : 0)};
  height: 18px;
  transform: ${({ direction }) => `scaleY(${direction === 'asc' ? -1 : 1})`};
`

const SortLabel = styled.button`
  border: 0;
  outline: none;
  user-select: none;
  background: transparent;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: ${({ align }) => (align === 'right' ? 'row' : 'row-reverse')};
  align-items: center;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    opacity: 0.6;

    ${IconWrapper} {
      opacity: 1;
    }
  }
`

const TableSortLabel = ({ className, isActive, direction, align, onClick, children }) => {
  const theme = useTheme()

  const handleClick = useCallback(() => {
    let newDirection = direction
    if (isActive) {
      newDirection = direction === 'asc' ? 'desc' : 'asc'
    }
    onClick?.(newDirection)
  }, [isActive, direction])

  return (
    <SortLabel className={className} align={align} onClick={handleClick}>
      <IconWrapper isActive={isActive} direction={direction} align={align}>
        <RiSortDesc size="18px" color={theme?.colors[VARIANT.NTRL_LIGHT]?.main} />
      </IconWrapper>

      {children}
    </SortLabel>
  )
}

TableSortLabel.defaultProps = {
  isActive: false,
  direction: 'asc',
  align: 'left',
}

export { Table, TableHead, TableBody, TableRow, TableCell, TablePagination, TableSortLabel }
