import { useState } from 'react';
import { useScrollIntoView } from '@mantine/hooks';
import { useForm as usePrecognitionForm } from 'laravel-precognition-react-inertia';
import { isObject } from 'lodash';

export default function useForm(initialMethod, initialUrl, initialData) {
  const [method, setMethod] = useState(initialMethod);
  const [url, setUrl] = useState(initialUrl);

  const form = usePrecognitionForm(method, url, initialData);
  const { scrollIntoView } = useScrollIntoView({ duration: 1000 });

  const submit = (e, props) => {
    e?.preventDefault?.();

    form.submit({
      preserveScroll: false,
      onError: () => {
        const target = document.querySelector('[data-error="true"]');
        if (target) {
          scrollIntoView({ target });
        }
      },
      ...props,
    });
  };

  const updateValue = (field, value) => {
    if (isObject(field)) {
      form.setData(field);
      form.clearErrors();
    } else {
      form.setData(field, value);
      form.forgetError(field);
    }
  };

  form.setMethod = setMethod;
  form.setAction = setUrl;

  return [form, submit, updateValue];
}
