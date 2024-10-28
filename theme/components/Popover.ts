import { popoverAnatomy as parts } from '@chakra-ui/anatomy';
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from '@chakra-ui/styled-system';
import { cssVar, mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const $popperBg = cssVar('popper-bg');

const $arrowBg = cssVar('popper-arrow-bg');
const $arrowShadowColor = cssVar('popper-arrow-shadow-color');

const baseStylePopper = defineStyle({
  zIndex: 'popover',
});

const baseStyleContent = defineStyle((props) => {
  const bg = mode('#000', '#fff')(props);
  const shadowColor = mode('blackAlpha.200', 'whiteAlpha.300')(props);
  const borderColor = mode('#FFF', '#FFF')(props);

  return {
    [$popperBg.variable]: `#F7FAFC`,
    bg: $popperBg.reference,
    [$arrowBg.variable]: $popperBg.reference,
    [$arrowShadowColor.variable]: `#F7FAFC`,
    _dark: {
      [$popperBg.variable]: `#141414`,
      [$arrowShadowColor.variable]: `#141414`,
      boxShadow: 'dark-lg',
    },
    width: 'xs',
    border: 'none',
    borderColor: { borderColor },
    borderRadius: '0',
    boxShadow: 'none',
    zIndex: 'inherit',
    _focusVisible: {
      outline: 0,
      boxShadow: '2xl',
    },
  };
});

const baseStyleHeader = defineStyle({
  px: 3,
  py: 2,
  borderBottomWidth: '1px',
});

const baseStyleBody = defineStyle({
  px: 4,
  py: 4,
});

const baseStyleFooter = defineStyle({
  px: 3,
  py: 2,
  borderTopWidth: '1px',
});

const baseStyleCloseButton = defineStyle({
  position: 'absolute',
  borderRadius: '0',
  top: 1,
  insetEnd: 2,
  padding: 2,
});

const baseStyle = definePartsStyle((props) => ({
  popper: baseStylePopper,
  content: baseStyleContent(props),
  header: baseStyleHeader,
  body: baseStyleBody,
  footer: baseStyleFooter,
  arrow: {},
  closeButton: baseStyleCloseButton,
}));

const Popover = defineMultiStyleConfig({
  baseStyle,
});

export default Popover;
