import React from "react";
import { Field } from "formik";
import { Form } from "semantic-ui-react";

type MyFieldProps = {
  id: string;
  name: string;
  type: string;
  label: string;
};

export default function MyField({ label, id, name, type }: MyFieldProps) {
  return (
    <Form.Field>
      <label htmlFor={id}>{label}</label>
      <Field type={type} id={id} name={name} />
    </Form.Field>
  );
}
