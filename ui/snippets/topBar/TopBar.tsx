import { Flex, Divider, useColorModeValue, Box } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import { CONTENT_MAX_WIDTH } from 'ui/shared/layout/utils';

import DeFiDropdown from './DeFiDropdown';
import NetworkMenu from './NetworkMenu';
import Settings from './settings/Settings';
import TopBarStats from './TopBarStats';

const TopBar = () => {
  const bgColor = useColorModeValue('#FFF', '#000');
  const bordercolorset = useColorModeValue('RGBA(16, 17, 18, 0.08)', '#1F1F1F');
  return (
    <Box bgColor={ bgColor } border="1px" borderColor={ bordercolorset }>
      <Flex
        py={ 2 }
        px={{ base: 3, lg: 6 }}
        maxW={ `${ CONTENT_MAX_WIDTH }px` }
        m="0 auto"
        justifyContent="space-between"
        alignItems="center"
      >
        <TopBarStats/>
        <Flex alignItems="center">
          { config.features.deFiDropdown.isEnabled && (
            <>
              <DeFiDropdown/>
              <Divider mr={ 3 } ml={{ base: 2, sm: 3 }} height={ 4 } orientation="vertical"/>
            </>
          ) }
          <Settings/>
          { config.UI.navigation.layout === 'horizontal' && Boolean(config.UI.navigation.featuredNetworks) && (
            <Box display={{ base: 'none', lg: 'flex' }}>
              <Divider mx={ 3 } height={ 4 } orientation="vertical"/>
              <NetworkMenu/>
            </Box>
          ) }
        </Flex>
      </Flex>
    </Box>
  );
};

export default React.memo(TopBar);
