import { Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import MyField from "../../components/MyField";
import { ModalValues } from "./wheel";
import { Modal, Button, Container } from "semantic-ui-react";
import Layout from "../../components/Layout";

const VolumetricSchema = Yup.object({
  diameter: Yup.number().required("Champs requis"),
  height: Yup.number().required("Champs requis"),
});

export default function Volumetric() {
  const initialValues: FormValues = {
    diameter: 0,
    height: 0,
  };
  const [modal, setModal] = useState<ModalValues>({
    show: false,
    result: null,
  });

  const calculateVolumetric = ({ diameter, height }: FormValues) => {
    return +(((Math.PI * Math.sqrt(diameter)) / 4) * height).toFixed(2);
  };

  const handleSubmit = (values: FormValues) => {
    console.log(values);
    setModal({
      show: true,
      result: calculateVolumetric(values),
    });
  };

  const handleClose = () => {
    setModal({
      show: false,
      result: null,
    });
  };

  return (
    <Layout title="Calcul volumétrique" iconName="refresh">
      <Container className="volumetric">
        <Formik
          initialValues={initialValues}
          validationSchema={VolumetricSchema}
          onSubmit={handleSubmit}
        >
          <Form className="ui form">
            <MyField
              type="number"
              id="diameter"
              name="diameter"
              label="Diamètre roue"
            />
            <MyField type="number" id="height" name="height" label="Hauteur" />
            <Button type="submit">Calculer</Button>
          </Form>
        </Formik>
        {modal.show && (
          <Modal open={modal.show} size="small">
            <Modal.Header>Résultat</Modal.Header>
            <Modal.Content>{modal.result} cc</Modal.Content>
            <Modal.Actions>
              <Button onClick={handleClose}>Quitter</Button>
            </Modal.Actions>
          </Modal>
        )}
      </Container>
    </Layout>
  );
}

type FormValues = {
  diameter: number;
  height: number;
};
