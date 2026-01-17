'use client';

import { Box } from '@chakra-ui/react';
import CompaniesTable from '@/components/CompaniesTable/CompaniesTable';

export default function Home() {
  return (
    <main>
      <Box maxW="container.xl" py={8}>
        <CompaniesTable />
      </Box>
    </main>
  );
}
