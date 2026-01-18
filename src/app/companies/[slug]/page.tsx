'use client';

import { TaxFiling } from '@/components/CompaniesTable/CompaniesTable';
import {
  Box,
  Card,
  Spinner,
  Text,
  Badge,
  Link,
  Table,
  Flex,
  Heading,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';

const fetchCompanyTaxFilings = async (id: string) => {
  const response = await fetch(`http://localhost:3000/companies/${id}`);
  return response.json();
};

interface CompanyTaxFilingsResponseError {
  error: string;
}

interface CompanyTaxFilingsResponseSuccess {
  data: {
    taxFilings: TaxFiling[];
  };
}

// Utility functions from CompaniesTable
const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number | null): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

const formatDelta = (
  amount: number | null,
  percent: number | null,
  isCurrency: boolean = true
) => {
  if (amount === null || percent === null) {
    return <Text color="gray.500">N/A</Text>;
  }

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

const CompanyPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const id = slug;

  const { data, isFetching, error, isError } = useQuery<
    CompanyTaxFilingsResponseSuccess | CompanyTaxFilingsResponseError
  >({
    queryKey: ['company', id],
    queryFn: () => fetchCompanyTaxFilings(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (data && 'error' in data) {
    return <div>Error: {data.error}</div>;
  }

  if (isFetching) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  const taxFilings = data?.data.taxFilings || [];
  const latestFiling = taxFilings[0]; // Assuming filings are sorted by most recent

  if (!latestFiling) {
    return <Text>No tax filings found for this company.</Text>;
  }

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      {/* Company Card */}
      <Card.Root mb={8}>
        <Card.Body>
          <VStack align="start" gap={4}>
            <Heading size="lg">{latestFiling.businessName || 'N/A'}</Heading>

            <HStack gap={6} flexWrap="wrap">
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  EIN
                </Text>
                <Text fontFamily="mono" fontWeight="medium">
                  {latestFiling.ein || 'N/A'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Website
                </Text>
                {latestFiling.websiteUrl &&
                latestFiling.websiteUrl !== 'N/A' &&
                latestFiling.websiteUrl.trim() !== '' ? (
                  <Link
                    href={latestFiling.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="blue.500"
                    textDecoration="underline"
                  >
                    {latestFiling.websiteUrl}
                  </Link>
                ) : (
                  <Text color="gray.400">N/A</Text>
                )}
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Total Filings
                </Text>
                <Text fontWeight="medium">{taxFilings.length}</Text>
              </Box>
            </HStack>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>
                Mission Description
              </Text>
              <Text>
                {latestFiling.missionDescription &&
                latestFiling.missionDescription.trim() !== ''
                  ? latestFiling.missionDescription
                  : 'N/A'}
              </Text>
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Tax Filings Table */}
      <Box>
        <Heading size="md" mb={4}>
          Tax Filings
        </Heading>

        <Box overflowX="auto">
          <Table.Root variant="line" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Tax Year</Table.ColumnHeader>
                <Table.ColumnHeader>Return Type</Table.ColumnHeader>
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
                <Table.ColumnHeader textAlign="end">
                  PY Assets
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Employee Count
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  PY Employees
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Revenue Δ
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Expenses Δ
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Assets Δ
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">
                  Employees Δ
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {taxFilings.map((filing: TaxFiling) => (
                <Table.Row key={filing.id}>
                  <Table.Cell>
                    <Text fontWeight="medium">{filing.taxYear}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme="blue" variant="subtle">
                      {filing.returnType}
                    </Badge>
                  </Table.Cell>
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
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </Box>
  );
};

export default CompanyPage;
