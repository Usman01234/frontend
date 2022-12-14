import { Box } from '@chakra-ui/react';
import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';

import { base as txMock } from 'mocks/txs/tx';
import TestApp from 'playwright/TestApp';

import AddressTxs from './AddressTxs';

const API_URL = '/node-api/addresses/0xd789a607CEac2f0E14867de4EB15b15C9FFB5859/transactions';

const hooksConfig = {
  router: {
    query: { id: '0xd789a607CEac2f0E14867de4EB15b15C9FFB5859' },
  },
};

test('address txs +@mobile +@desktop-xl', async({ mount, page }) => {
  await page.route(API_URL, (route) => route.fulfill({
    status: 200,
    body: JSON.stringify({ items: [ txMock, txMock ], next_page_params: { block: 1 } }),
  }));

  const component = await mount(
    <TestApp>
      <Box h={{ base: '134px', lg: 6 }}/>
      <AddressTxs/>
    </TestApp>,
    { hooksConfig },
  );

  await page.waitForResponse(API_URL),

  await expect(component).toHaveScreenshot();
});