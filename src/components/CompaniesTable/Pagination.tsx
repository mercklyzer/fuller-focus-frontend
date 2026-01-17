import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  itemsPerPage,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  itemsPerPage: number;
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <Flex justify="space-between" align="center" mt={6}>
      <Text fontSize="sm" color="gray.600">
        Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{' '}
        {totalCount.toLocaleString()} results
      </Text>

      <HStack gap={2}>
        {/* Previous page */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {/* Page numbers */}
        {getVisiblePages().map((page, index) => (
          <Box key={index}>
            {page === '...' ? (
              <Text px={2} fontSize="sm" color="gray.500">
                ...
              </Text>
            ) : (
              <Button
                size="sm"
                variant={currentPage === page ? 'solid' : 'ghost'}
                colorScheme={currentPage === page ? 'blue' : 'gray'}
                onClick={() => onPageChange(page as number)}
                minW={8}
              >
                {page}
              </Button>
            )}
          </Box>
        ))}

        {/* Next page */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </HStack>
    </Flex>
  );
};
