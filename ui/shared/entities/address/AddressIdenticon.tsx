import { Box, Image } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React from 'react';

import config from 'configs/app';
import * as cookies from 'lib/cookies';
import IdenticonGithub from 'ui/shared/IdenticonGithub';

interface IconProps {
  hash: string;
  size: number;
}

const Icon = dynamic(
  async() => {
    const type = cookies.get(cookies.NAMES.ADDRESS_IDENTICON_TYPE) || config.UI.views.address.identiconType;
    switch (type) {
      case 'github': {
        // eslint-disable-next-line react/display-name
        return (props: IconProps) => <IdenticonGithub size={ props.size } seed={ props.hash }/>;
      }

      case 'blockie': {
        const { blo } = (await import('blo'));

        // eslint-disable-next-line react/display-name
        return (props: IconProps) => {
          const data = blo(props.hash as `0x${ string }`, props.size);
          return (
            <Image
              src={ data }
              alt={ `Identicon for ${ props.hash }}` }
            />
          );
        };
      }

      case 'jazzicon': {
        const Jazzicon = await import('react-jazzicon');

        // eslint-disable-next-line react/display-name
        return (props: IconProps) => {
          return (
            <Jazzicon.default
              diameter={ props.size }
              seed={ Jazzicon.jsNumberForAddress(props.hash) }
            />
          );
        };
      }

      case 'gradient_avatar': {
        const GradientAvatar = (await import('gradient-avatar')).default;

        // eslint-disable-next-line react/display-name
        return (props: IconProps) => {
          const svg = GradientAvatar(props.hash, props.size, 'circle');
          return <div dangerouslySetInnerHTML={{ __html: svg }}/>;
        };
      }

      default: {
        return () => null;
      }
    }
  }, {
    ssr: false,
  });

type Props = IconProps;

const AddressIdenticon = ({ size, hash }: Props) => {
  return (
    <Box boxSize={ `${ size }px` } borderRadius="0" overflow="hidden">
      <Icon size={ size } hash={ hash }/>
    </Box>
  );
};

export default React.memo(AddressIdenticon);
