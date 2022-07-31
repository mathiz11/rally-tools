import React, { useState } from "react";
import { Button, Container, Form, Icon, Input } from "semantic-ui-react";
import Layout from "../../components/Layout";
import NumberInput from "../../components/NumberInput";

const FuelCalculator = () => {
  const [stepConso, setStepConso] = useState(0.2);
  const [specialConso, setSpecialConso] = useState(0.6);
  const [special, setSpecial] = useState(0);
  const [showCalcul, setShowCalcul] = useState(false);
  const [inputList, setInputList] = useState([
    { name: "test", value: undefined, isStep: true, isOptional: false },
  ]);
  const [result, setResult] = useState(undefined);

  function changeStepConso(value) {
    setStepConso(Number((stepConso + value).toFixed(2)));
  }
  function changeSpecialConso(value) {
    setSpecialConso(Number((specialConso + value).toFixed(2)));
  }
  function changeSpecial(value) {
    setSpecial(special + value);
  }

  function generateForm() {
    let tempInputList = [
      { name: "step1", value: undefined, isStep: true, isOptional: false },
    ];
    for (let i = 1; i <= special; i++) {
      if (i !== 1) {
        tempInputList.push({
          name: "step" + i,
          value: undefined,
          isStep: true,
          isOptional: false,
        });
      }
      tempInputList.push({
        name: "special" + i,
        value: undefined,
        isStep: false,
        isOptional: false,
      });
    }
    tempInputList.push({
      name: "step" + (special + 1),
      value: undefined,
      isStep: true,
      isOptional: false,
    });
    setInputList(tempInputList);
    setShowCalcul(true);
  }

  function handleChange(e, id) {
    const list = [...inputList];
    list[id].value = e.target.value === "" ? undefined : Number(e.target.value);
    setInputList(list);
  }

  function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    let essence = 0;
    inputList.forEach((input) => {
      essence += input.isStep
        ? input.value * stepConso
        : input.value * specialConso;
    });
    setResult(essence.toFixed(2));
  }

  function addStep(oldIndex) {
    let list = [...inputList];
    list.splice(oldIndex + 1, 0, {
      name: "step" + list.length,
      value: undefined,
      isStep: true,
      isOptional: true,
    });
    setInputList(list);
  }

  function deleteStep(i) {
    let list = [...inputList];
    list.splice(i, 1);
    setInputList(list);
  }

  return (
    <Layout title="Calculateur d'essence" iconName="refresh">
      <Container>
        <NumberInput
          title={"Consommation liaison"}
          value={stepConso}
          plus={() => changeStepConso(0.01)}
          minus={() => changeStepConso(-0.01)}
        />
        <NumberInput
          title={"Consommation spéciale"}
          value={specialConso}
          plus={() => changeSpecialConso(0.01)}
          minus={() => changeSpecialConso(-0.01)}
        />
        <NumberInput
          title={"Spéciales"}
          value={special}
          plus={() => changeSpecial(1)}
          minus={() => changeSpecial(-1)}
        />
        <Button
          icon
          disabled={stepConso === 0 || specialConso === 0 || special === 0}
          onClick={() => generateForm()}
        >
          <Icon name="chevron down" size="large" />
        </Button>
        {showCalcul && (
          <div className="calculator">
            <div className="calculator-header">Début</div>
            <Form onSubmit={handleSubmit}>
              {inputList.map((input, i) => (
                <Form.Field key={i}>
                  <label>{input.isStep ? "Liaison" : "Spéciale"}</label>
                  <div className="calculator-input-container">
                    <Input
                      type="number"
                      step="0.01"
                      id={i.toString()}
                      name={input.name}
                      value={input.value}
                      onChange={(e) => handleChange(e, i)}
                      required
                    />
                    {input.isStep && !input.isOptional && (
                      <Button icon type="button" onClick={() => addStep(i)}>
                        <Icon name="plus" />
                      </Button>
                    )}
                    {input.isStep && input.isOptional && (
                      <Button icon type="button" onClick={() => deleteStep(i)}>
                        <Icon name="trash" />
                      </Button>
                    )}
                  </div>
                </Form.Field>
              ))}
              <Button type="submit">Calculer</Button>
            </Form>
            <div className="calculator-footer">Fin</div>
          </div>
        )}
        {result && (
          <div className="calculator-result">
            <h2>Résultat</h2>
            <span>{result} L</span>
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default FuelCalculator;
