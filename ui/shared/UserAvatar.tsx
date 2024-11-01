import { SkeletonCircle, Image } from '@chakra-ui/react';
import React from 'react';

import { useAppContext } from 'lib/contexts/app';
import * as cookies from 'lib/cookies';
import useFetchProfileInfo from 'lib/hooks/useFetchProfileInfo';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  size: number;
  fallbackIconSize?: number;
}

const UserAvatar = ({ size, fallbackIconSize = 20 }: Props) => {
  const appProps = useAppContext();
  const hasAuth = Boolean(cookies.get(cookies.NAMES.API_TOKEN, appProps.cookies));
  const [ isImageLoadError, setImageLoadError ] = React.useState(false);
  const { data, isFetched } = useFetchProfileInfo();

  const sizeString = `${ size }px`;

  const handleImageLoadError = React.useCallback(() => {
    setImageLoadError(true);
  }, []);

  if (hasAuth && !isFetched) {
    return <SkeletonCircle h={ sizeString } w={ sizeString }/>;
  }

  return (
    <Image
      flexShrink={ 0 }
      src={ data?.avatar }
      alt={ `Profile picture of ${ data?.name || data?.nickname || '' }` }
      boxSize={ `${ size }px` }
      borderRadius="0"
      overflow="hidden"
      fallback={ isImageLoadError || !data?.avatar ? <IconSvg name="profile" boxSize={ `${ fallbackIconSize }px` }/> : undefined }
      onError={ handleImageLoadError }
    />
  );
};

export default React.memo(UserAvatar);
