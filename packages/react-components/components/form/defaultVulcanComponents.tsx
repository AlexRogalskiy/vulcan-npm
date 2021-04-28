import { FormError } from "./FormError";
import { FormComponent } from "./FormComponent";
import { FormComponentLoader } from "./FormComponentLoader";
import { FormElement } from "./FormElement";
import { FormGroup } from "./FormGroup";
import { FormIntl, FormIntlItemLayout, FormIntlLayout } from "./FormIntl";
import { FormErrors } from "./FormErrors";
import { FormSubmit } from "./FormSubmit";
import { FormLayout } from "./FormLayout";
import {
  FormNestedArrayInnerLayout,
  IconAdd,
  IconRemove,
} from "./FormNestedArray";
import { FormNestedArrayLayout } from "./FormNestedArrayLayout";
import { FormNestedItem, FormNestedItemLayout } from "./FormNestedItem";
import { FormNestedDivider } from "./FormNestedDivider";
import { FieldErrors } from "./FieldErrors";
import { FormNestedObject, FormNestedObjectLayout } from "./FormNestedObject";
import { FormOptionLabel } from "./FormOptionLabel";
import { Form } from "./Form";

import {
  FormComponentDefault,
  FormComponentPassword,
  FormComponentNumber,
  FormComponentUrl,
  FormComponentEmail,
  FormComponentTextarea,
  FormComponentCheckbox,
  FormComponentCheckboxGroup,
  FormComponentRadioGroup,
  FormComponentSelect,
  FormComponentSelectMultiple,
  FormComponentDateTime,
  FormComponentDate,
  FormComponentTime,
  FormComponentStaticText,
  FormComponentLikert,
  FormComponentAutocomplete,
  FormComponentMultiAutocomplete,
} from "./DefaultFormComponents";

export interface PossibleCoreComponents {
  Loading: any;
  FormattedMessage: any;
  Alert: any;
  Button: any;
  Icon: any;
}
// TODO: differentiate components that are provided out of the box and those that require a UI frameworK?
export interface PossibleFormComponents {
  FormError: any; // FieldErrors
  // From FormComponent
  FormComponentDefault: any;
  FormComponentPassword: any;
  FormComponentNumber: any;
  FormComponentUrl: any;
  FormComponentEmail: any;
  FormComponentTextarea: any;
  FormComponentCheckbox: any;
  FormComponentCheckboxGroup: any;
  FormComponentRadioGroup: any;
  FormComponentSelect: any;
  FormComponentSelectMultiple: any;
  FormComponentDateTime: any;
  FormComponentDate: any;
  // FormComponentDate2: any;
  FormComponentTime: any;
  FormComponentStaticText: any;
  FormComponentLikert: any;
  FormComponentAutocomplete: any;
  FormComponentMultiAutocomplete: any;
  //
  FormComponent: any;
  FormComponentLoader: any;
  FormElement: any;
  FormGroup: any;
  // intl
  FormIntlLayout: any;
  FormIntlItemLayout: any;
  FormIntl: any;
  // Layout
  FormErrors: any;
  FormSubmit: any;
  FormLayout: any;

  // arrays and objects
  FormNestedArrayInnerLayout: any;
  FormNestedArrayLayout: any;
  FormNestedItem: any;
  IconAdd: any;
  IconRemove: any;
  FieldErrors: any;
  FormNestedDivider: any;
  //
  FormNestedItemLayout: any;
  FormNestedObjectLayout: any;
  FormNestedObject: any;
  FormOptionLabel: any;
  // Form
  Form: any;
}
export type PossibleVulcanComponents = PossibleCoreComponents &
  PossibleFormComponents;

const defaultCoreComponents: PossibleCoreComponents = {
  Loading: () => null,
  FormattedMessage: () => null,
  Alert: () => null,
  Button: () => null,
  Icon: () => null,
};
const defaultFormComponents: PossibleFormComponents = {
  FormError, // used by: FieldErrors
  // To be defined by the UI framework
  // TODO: add defaults in React components
  FormComponentDefault,
  FormComponentPassword,
  FormComponentNumber,
  FormComponentUrl,
  FormComponentEmail,
  FormComponentTextarea,
  FormComponentCheckbox,
  FormComponentCheckboxGroup,
  FormComponentRadioGroup,
  FormComponentSelect,
  FormComponentSelectMultiple,
  FormComponentDateTime,
  FormComponentDate,
  //FormComponentDate2,
  FormComponentTime,
  FormComponentStaticText,
  FormComponentLikert,
  FormComponentAutocomplete,
  FormComponentMultiAutocomplete,
  // Components defined in default vulcan/forms
  FormComponent,
  FormComponentLoader,
  FormElement,
  FormGroup,
  FormIntl,
  FormIntlItemLayout,
  FormIntlLayout,

  // Layout
  FieldErrors,
  FormErrors,
  FormSubmit,
  FormLayout,

  FormNestedArrayInnerLayout,
  FormNestedArrayLayout,
  FormNestedItem,
  IconAdd,
  IconRemove,
  FormNestedDivider,
  // nested item
  FormNestedItemLayout,
  FormNestedObjectLayout,
  FormNestedObject,
  FormOptionLabel,
  //
  Form,
};

export const defaultVulcanComponents = {
  ...defaultCoreComponents,
  ...defaultFormComponents,
};