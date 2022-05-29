import { arrayOf, instanceOf, node, number, oneOfType, shape, string, func } from 'prop-types';
import { ELEMENT_FIELDS } from './constants';


const OptionType = shape({
  value: oneOfType([string, number]).isRequired,
  label: node.isRequired
});

const OptionListType = arrayOf(OptionType);

const StyleProp = oneOfType([string, number]);

const FetchedFile = shape({
  location: string.isRequired,
  mime: string.isRequired
});

const SomeFile = oneOfType([FetchedFile, instanceOf(File)]);

const Ratio = shape({ w: number.isRequired, h: number.isRequired });

const MultiField = oneOfType([string, arrayOf(string)]);

const ElementData = shape({ [ELEMENT_FIELDS.tag]: string, [ELEMENT_FIELDS.content]: arrayOf(string) });

const Prefixes = shape({
  [ELEMENT_FIELDS.tag]: oneOfType([func, string]).isRequired,
  [ELEMENT_FIELDS.content]: oneOfType([func, string]).isRequired,
})

export { OptionType, OptionListType, StyleProp, FetchedFile, SomeFile, Ratio, MultiField, ElementData, Prefixes };