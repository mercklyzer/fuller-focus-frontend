'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box,
  Table,
  Text,
  Spinner,
  Alert,
  Flex,
  Badge,
  Link,
  Button,
  HStack,
} from '@chakra-ui/react';

// Type definitions based on the provided schema
interface TaxFiling {
  id: number;
  ein: string;
  returnType: string;
  taxYear: number;
  fileName: string;
  businessName: string;
  websiteUrl: string;
  missionDescription: string;
  totalRevenue: number;
  totalExpenses: number;
  totalAssets: number;
  employeeCount: number | null;
  pyTotalRevenue: number | null;
  pyTotalExpenses: number | null;
  pyTotalAssets: number | null;
  pyEmployeeCount: number | null;
  createdAt: string;
  updatedAt: string;
  revenueDeltaAmount: number | null;
  revenueDeltaPercent: number | null;
  expensesDeltaAmount: number | null;
  expensesDeltaPercent: number | null;
  assetsDeltaAmount: number | null;
  assetsDeltaPercent: number | null;
  employeesDeltaAmount: number | null;
  employeesDeltaPercent: number | null;
}

interface CompaniesResponse {
  data: {
    taxFilings: TaxFiling[];
  };
  meta: {
    totalCount: number;
    page: number;
    totalPages: number;
  };
}

// Fetch function with pagination
const fetchCompanies = async (page: number = 1): Promise<CompaniesResponse> => {
  const response = await fetch(`http://localhost:3000/companies?page=${page}`);

  if (!response.ok) {
    throw new Error('Failed to fetch companies data');
  }

  return response.json();
};

// Format currency
const formatCurrency = (amount: number | null): string => {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
const formatPercent = (percent: number | null): string => {
  if (percent === null) return 'N/A';
  return `${percent.toFixed(2)}%`;
};

// Format delta with color coding
const formatDelta = (
  amount: number | null,
  percent: number | null,
  isCurrency: boolean = true
) => {
  const isAmountPositive = amount !== null && amount > 0;
  const isAmountNegative = amount !== null && amount < 0;
  const isPercentPositive = percent !== null && percent > 0;
  const isPercentNegative = percent !== null && percent < 0;

  return (
    <Box>
      <Text
        color={
          isAmountPositive
            ? 'green.500'
            : isAmountNegative
              ? 'red.500'
              : 'gray.500'
        }
      >
        {isCurrency ? formatCurrency(amount) : amount}
      </Text>
      <Text
        fontSize="sm"
        color={
          isPercentPositive
            ? 'green.500'
            : isPercentNegative
              ? 'red.500'
              : 'gray.500'
        }
      >
        ({formatPercent(percent)})
      </Text>
    </Box>
  );
};

// Pagination component
const Pagination = ({
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

export default function CompaniesTable() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, isError } = useQuery<CompaniesResponse>({
    queryKey: ['companies', currentPage],
    queryFn: () => fetchCompanies(currentPage),
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
        <Text ml={4}>Loading companies data...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert.Root status="error" title="Error!">
        <Alert.Indicator />
        <Alert.Title>Error!</Alert.Title>
      </Alert.Root>
    );
  }

  if (!data?.data?.taxFilings?.length) {
    return (
      <Alert.Root status="info" title="No Data">
        <Alert.Indicator />
        <Alert.Title>No tax filings found.</Alert.Title>
      </Alert.Root>
    );
  }

  return (
    <Box>
      {/* Meta Information */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Tax Filings
        </Text>
        <Box>
          <Text fontSize="sm" color="gray.600">
            Page {data.meta.page} of {data.meta.totalPages} •{' '}
            {data.meta.totalCount.toLocaleString()} total records
          </Text>
        </Box>
      </Flex>

      {/* Table */}
      <Box overflowX="auto">
        <Table.Root variant="line" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader textAlign="end">
                Business Name
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">EIN</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Return Type
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Tax Year</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Total Revenue
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                PY Revenue
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Total Expenses
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                PY Expenses
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Total Assets
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">PY Assets</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Employee Count
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                PY Employees
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Revenue Δ</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Expenses Δ
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Assets Δ</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">
                Employees Δ
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Website</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.data.taxFilings.map((filing) => (
              <Table.Row key={filing.id}>
                <Table.Cell maxW="200px" textAlign="end">
                  <Text fontWeight="medium">{filing.businessName}</Text>
                  {filing.missionDescription && (
                    <Text fontSize="xs" color="gray.500">
                      {filing.missionDescription}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell fontFamily="mono" fontSize="sm" textAlign="end">
                  {filing.ein}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  <Badge colorScheme="blue" variant="subtle">
                    {filing.returnType}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{filing.taxYear}</Table.Cell>
                <Table.Cell textAlign="end">
                  {formatCurrency(filing.totalRevenue)}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatCurrency(filing.pyTotalRevenue)}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatCurrency(filing.totalExpenses)}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatCurrency(filing.pyTotalExpenses)}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatCurrency(filing.totalAssets)}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatCurrency(filing.pyTotalAssets)}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {filing.employeeCount !== null
                    ? filing.employeeCount.toLocaleString()
                    : 'N/A'}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {filing.pyEmployeeCount !== null
                    ? filing.pyEmployeeCount.toLocaleString()
                    : 'N/A'}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatDelta(
                    filing.revenueDeltaAmount,
                    filing.revenueDeltaPercent
                  )}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatDelta(
                    filing.expensesDeltaAmount,
                    filing.expensesDeltaPercent
                  )}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatDelta(
                    filing.assetsDeltaAmount,
                    filing.assetsDeltaPercent
                  )}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {formatDelta(
                    filing.employeesDeltaAmount,
                    filing.employeesDeltaPercent,
                    false
                  )}
                </Table.Cell>
                <Table.Cell textAlign="end">
                  {filing.websiteUrl !== 'N/A' && filing.websiteUrl ? (
                    <Link
                      href={filing.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      textDecoration="underline"
                      fontSize="sm"
                    >
                      Visit
                    </Link>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      N/A
                    </Text>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={data.meta.totalPages}
        onPageChange={handlePageChange}
        totalCount={data.meta.totalCount}
        itemsPerPage={10} // fixed 10 items per page as defined by the backend
      />
    </Box>
  );
}
