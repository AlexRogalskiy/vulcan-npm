import React from "react";
import type { PossibleVulcanComponents } from "./typings";
import { Dummy } from "./Dummy";

// We need this to shut TypeScript up
// You should use the Provider to get the right default values
export const VulcanComponentsContext =
  React.createContext<PossibleVulcanComponents>({
    Alert: Dummy,
    Button: Dummy,
    FieldErrors: Dummy,
    HeadTags: Dummy,
    LoadingButton: Dummy,
    MutationButton: Dummy,
    TooltipTrigger: Dummy,
    Dropdown: Dummy,
    // form
    Form: Dummy,
    FormComponent: Dummy,
    FormComponentAutocomplete: Dummy,
    FormComponentCheckbox: Dummy,
    FormComponentCheckboxGroup: Dummy,
    FormComponentDate: Dummy,
    FormComponentDateTime: Dummy,
    FormComponentDefault: Dummy,
    FormComponentEmail: Dummy,
    FormComponentInner: Dummy,
    FormComponentLikert: Dummy,
    FormComponentLoader: Dummy,
    FormComponentMultiAutocomplete: Dummy,
    FormComponentNumber: Dummy,
    FormComponentPassword: Dummy,
    FormComponentRadioGroup: Dummy,
    FormComponentSelect: Dummy,
    FormComponentSelectMultiple: Dummy,
    FormComponentStaticText: Dummy,
    FormComponentTextarea: Dummy,
    FormComponentTime: Dummy,
    FormComponentUrl: Dummy,
    FormElement: Dummy,
    FormError: Dummy,
    FormErrors: Dummy,
    FormGroup: Dummy,
    FormGroupHeader: Dummy,
    FormGroupLayout: Dummy,
    FormIntl: Dummy,
    FormIntlItemLayout: Dummy,
    FormIntlLayout: Dummy,
    FormLayout: Dummy,
    FormNestedArray: Dummy,
    FormNestedArrayInnerLayout: Dummy,
    FormNestedArrayLayout: Dummy,
    FormNestedDivider: Dummy,
    FormNestedItem: Dummy,
    FormNestedItemLayout: Dummy,
    FormNestedObject: Dummy,
    FormNestedObjectLayout: Dummy,
    FormOptionLabel: Dummy,
    FormSubmit: Dummy,
    FormattedMessage: Dummy,
    Icon: Dummy,
    IconAdd: Dummy,
    IconRemove: Dummy,
    Loading: Dummy,
    FormItem: Dummy,
  });
