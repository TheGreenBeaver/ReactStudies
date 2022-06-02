import { arrayOf, instanceOf, node, number, oneOfType, shape, string, func, oneOf } from 'prop-types';
import { ELEMENT_FIELDS, TASK_KINDS } from './constants';


const Option = shape({
  value: oneOfType([string, number]),
  label: node.isRequired
});

const OptionList = arrayOf(Option);

const StyleProp = oneOfType([string, number]);

const FetchedFile = shape({
  location: string.isRequired,
  mime: string.isRequired
});

const SomeFile = oneOfType([FetchedFile, instanceOf(File)]);

const Ratio = shape({ w: number.isRequired, h: number.isRequired });

const MultiField = oneOfType([string, arrayOf(string)]);

const ElementData = shape({ [ELEMENT_FIELDS.tag]: string, [ELEMENT_FIELDS.content]: arrayOf(string) });

const ElementFields = arrayOf(oneOf([...Object.values(ELEMENT_FIELDS)]));

const Prefixes = shape({
  [ELEMENT_FIELDS.tag]: oneOfType([func, string]).isRequired,
  [ELEMENT_FIELDS.content]: oneOfType([func, string]).isRequired,
});

const TaskKind = oneOf([...Object.values(TASK_KINDS)]);

export {
  Option,
  OptionList,
  StyleProp,
  FetchedFile,
  SomeFile,
  Ratio,
  MultiField,
  ElementData,
  ElementFields,
  Prefixes,
  TaskKind
};