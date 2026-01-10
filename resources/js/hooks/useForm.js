import { useState } from 'react';
import { useScrollIntoView } from '@mantine/hooks';
import { useForm as useInertiaForm } from '@inertiajs/react';
import { isObject } from 'lodash';
import dayjs from '@/utils/dayjsConfig';

/**
 * Cek apakah suatu nilai mengandung File
//  */
// function hasFile(value) {
//   if (value instanceof File) return true;
//   if (Array.isArray(value)) return value.some(hasFile);
//   if (isObject(value)) return Object.values(value).some(hasFile);
//   return false;
// }

/**
 * Hook form universal dengan dukungan File Upload
 */
export default function useForm(initialMethod, initialUrl, initialData) {
  const [method, setMethod] = useState(initialMethod);
  const [url, setUrl] = useState(initialUrl);

  const form = useInertiaForm(initialData);
  form.method = method;
  form.url = url;
  const { scrollIntoView } = useScrollIntoView({ duration: 1000 });

  /**
   * Submit form dengan auto deteksi File
   */
  const submit = (options = {}) => {
    const { data, ...props } = options;

    // If data is provided, merge it with form.data
    const submitData = data ? { ...form.data, ...data } : form.data;
    // const containsFile = hasFile(submitData);
    const finalData = objectToFormData(submitData);

    // // ✅ Logging aktif hanya di development mode
    // if (import.meta.env.DEV) {
    //   console.group('🧭 FORM SUBMISSION DEBUG');
    //   console.log('📍 URL:', url);
    //   console.log('📦 Method:', method);
    //   console.log('🕓 Timestamp:', new Date().toLocaleString());
    //   console.log('🔍 Contains file:', containsFile);

    //   if (containsFile) {
    //     console.log('📎 FormData contents:');
    //     for (let [key, value] of finalData.entries()) {
    //       console.log(`  ${key}:`, value);
    //     }
    //   } else {
    //     console.log('📝 Form data object:', finalData);
    //   }
    //   console.groupEnd();
    // }

    form.submit(method, url, {
      data: finalData,
      forceFormData: false, // Already FormData, no need to force conversion
      preserveScroll: false,
      onSuccess: (response) => {
        if (props.onSuccess) props.onSuccess(response);
      },
      onError: (errors) => {
        if (props.onError) props.onError(errors);
        const target = document.querySelector('[data-inertia-error]');
        if (target) {
          scrollIntoView({ target });
        }
      },
      onFinish: () => {
        if (props.onFinish) props.onFinish();
      },
      ...props,
    });
  };

  /**
   * Konversi object ke FormData
   */
  const objectToFormData = (obj, formData = new FormData(), parentKey = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const fieldKey = parentKey ? `${parentKey}[${key}]` : key;

      if (value instanceof File) {
        formData.append(fieldKey, value);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          // Array kosong tidak perlu di-append
        } else {
          value.forEach((item, index) => {
            if (item instanceof File) {
              formData.append(`${fieldKey}[${index}]`, item);
            } else if (isObject(item)) {
              objectToFormData(item, formData, `${fieldKey}[${index}]`);
            } else if (item !== null && item !== undefined) {
              formData.append(`${fieldKey}[${index}]`, item);
            }
          });
        }
      } else if (isObject(value) && !(value instanceof Date)) {
        if (Object.keys(value).length > 0) {
          objectToFormData(value, formData, fieldKey);
        }
      } else if (value !== null && value !== undefined) {
        // Convert Date to string
        if (value instanceof Date) {
          // FIX: Use dayjs with timezone to format date consistently with Asia/Jakarta timezone
          // Previously: value.toISOString().split('T')[0] which could cause off-by-one date errors
          // Now using dayjs.tz to ensure consistent timezone handling
          formData.append(fieldKey, dayjs(value).tz('Asia/Jakarta').format('YYYY-MM-DD'));
        } else {
          // Ensure numeric values are properly converted
          const numericValue = typeof value === 'number' ? value : parseFloat(value);
          if (!isNaN(numericValue) && isFinite(numericValue)) {
            formData.append(fieldKey, numericValue.toString());
          } else {
            formData.append(fieldKey, value);
          }
        }
      }
    });

    return formData;
  };

  /**
   * Update nilai form dan bersihkan error
   */
  const updateValue = (field, value) => {
    if (isObject(field)) {
      form.setData(field);
      form.clearErrors();
    } else {
      form.setData(field, value);
      form.clearErrors(field);
    }
  };

  // inject helper
  form.setMethod = setMethod;
  form.setAction = setUrl;

  return [form, submit, updateValue];
}
