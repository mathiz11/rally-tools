import React, { useState } from "react";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import MyField from "../../components/MyField";
import { Button, Container, Icon, Modal } from "semantic-ui-react";
import Layout from "../../components/Layout";

type FormValues = {
  z1: number;
  z2: number;
  z3: number;
  z4: number;
  speed: number;
  diameter: number;
};

export type ModalValues = {
  show: boolean;
  result: number;
};

const WheelSchema = Yup.object({
  z1: Yup.number().required("Champs requis"),
  z2: Yup.number().required("Champs requis"),
  z3: Yup.number().required("Champs requis"),
  z4: Yup.number().required("Champs requis"),
  speed: Yup.number().required("Champs requis"),
  diameter: Yup.number().required("Champs requis"),
});

export default function Wheel() {
  const initialValues: FormValues = {
    z1: 20,
    z2: 25,
    z3: 11,
    z4: 50,
    speed: 9600,
    diameter: 650,
  };
  const [modal, setModal] = useState<ModalValues>({
    show: false,
    result: null,
  });

  const calculateSpeedWheel = ({
    z1,
    z2,
    z3,
    z4,
    diameter,
    speed,
  }: FormValues) => {
    return +(
      speed *
      (z1 / z2) *
      (z3 / z4) *
      (diameter - 20) *
      Math.PI *
      (60 / 1000000)
    ).toFixed(2);
  };

  const handleSubmit = (values: FormValues) => {
    console.log(values);
    setModal({
      show: true,
      result: calculateSpeedWheel(values),
    });
  };

  const handleClose = () => {
    setModal({
      show: false,
      result: null,
    });
  };

  return (
    <Layout title="Calcul Vitesse roue" iconName="refresh">
      <Container className="wheel">
        <Formik
          initialValues={initialValues}
          validationSchema={WheelSchema}
          onSubmit={handleSubmit}
        >
          <Form className="ui form">
            <MyField
              type="number"
              id="speed"
              name="speed"
              label="Vitesse moteur"
            />
            <MyField type="number" id="z1" name="z1" label="Z1" />
            <MyField type="number" id="z2" name="z2" label="Z2" />
            <MyField type="number" id="z3" name="z3" label="Z3" />
            <MyField type="number" id="z4" name="z4" label="Z4" />
            <MyField
              type="number"
              id="diameter"
              name="diameter"
              label="Diamètre roue"
            />
            <Button type="submit">Calculer</Button>
          </Form>
        </Formik>
        {modal.show && (
          <Modal open={modal.show}>
            <Modal.Header>Résultat</Modal.Header>
            <Modal.Content>{modal.result} km/h</Modal.Content>
            <Modal.Actions>
              <Button onClick={handleClose}>Quitter</Button>
            </Modal.Actions>
          </Modal>
        )}
      </Container>
    </Layout>
  );
}
