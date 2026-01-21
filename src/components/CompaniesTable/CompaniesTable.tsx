'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
// import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Table,
  Text,
  Spinner,
  Alert,
  Flex,
  Badge,
  Link,
  Input,
} from '@chakra-ui/react';
import { Pagination } from './Pagination';

// Type definitions based on the provided schema
export interface TaxFiling {
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
const fetchCompanies = async (
  page: number = 1,
  businessNameFilter: string = ''
): Promise<CompaniesResponse> => {
  const response = await fetch(
    `http://localhost:3000/companies?page=${page}&q=${encodeURIComponent(businessNameFilter)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch companies data');
  }

  return response.json();
};

// Format currency
export const formatCurrency = (amount: number | null): string => {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercent = (percent: number | null): string => {
  if (percent === null) return 'N/A';
  return `${percent.toFixed(2)}%`;
};

// Format delta with color coding
export const formatDelta = (
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

export default function CompaniesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from URL
  const businessNameFilter = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const { data, isFetching, error, isError } = useQuery<CompaniesResponse>({
    queryKey: ['companies', currentPage, businessNameFilter],
    queryFn: () => fetchCompanies(currentPage, businessNameFilter),
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.replace(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', e.target.value);
    params.set('page', '1'); // Reset to first page on search
    router.replace(`?${params.toString()}`);
  };

  return (
    <Box>
      {isError && error && (
        <Alert.Root status="error" title="Error!">
          <Alert.Indicator />
          <Alert.Title>Error! {error?.message}</Alert.Title>
        </Alert.Root>
      )}

      {/* Meta Information */}
      {!isError && data && (
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="2xl" fontWeight="bold">
            Tax Filings
          </Text>
          <Input
            placeholder="Enter business name"
            value={businessNameFilter}
            onChange={handleSearchChange}
          />
          {data && (
            <Box>
              <Text fontSize="sm" color="gray.600">
                Page {data.meta.page} of {data.meta.totalPages} •{' '}
                {data.meta.totalCount.toLocaleString()} total records
              </Text>
            </Box>
          )}
        </Flex>
      )}

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
          {isFetching && <Spinner size="xl" />}
          {data?.data?.taxFilings.length === 0 && (
            <Text>No tax filings found.</Text>
          )}
          {!!data?.data?.taxFilings?.length && !isFetching && (
            <Table.Body>
              {data.data.taxFilings.map((filing: TaxFiling) => (
                <Table.Row key={filing.id}>
                  <Table.Cell maxW="200px" textAlign="end">
                    <Link href={`/companies/${filing.ein}`} color="blue.500">
                      <Text fontWeight="medium">{filing.businessName}</Text>
                    </Link>
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
          )}
        </Table.Root>
      </Box>

      {/* Pagination */}
      {data && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.meta.totalPages}
          onPageChange={handlePageChange}
          totalCount={data.meta.totalCount}
          itemsPerPage={10} // fixed 10 items per page as defined by the backend
        />
      )}
    </Box>
  );
}
