import { ethers } from 'ethers';
import { Button, Modal, Form } from 'react-bootstrap';
import { useState, useContext } from 'react';
import useBalances from '../../hooks/useBalance';
import { Web3Context } from '../App';

function Deposit({setBalance}) {
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const { contract, provider, accounts, tokenContract } = useContext(Web3Context);
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setDepositAmount(0);
  };
  const handleShowSuccess = () => setShowSuccess(true);
  const validateDepositAmount = (e) => {
      const value = Number(e.target.value);
      if (value < 0 && value > -100) {
          e.target.value = -Number(e.target.value);
      }
      else if (value < -100 || value > 100) {
          e.target.value = 100;
      }
      setDepositAmount(e.target.value);
  }

  const handleSubmit = async (e) => {
      const form = e.currentTarget;
      if (form.checkValidity() === false) {
          e.preventDefault();
          e.stopPropagation();
          setValidated(true);
      }
      else {
          e.preventDefault();
          setValidated(true);
          const amount = ethers.utils.parseEther(depositAmount);
          const tx = await contract.deposit({value: amount});
          handleClose();
          await tx.wait();
          setBalance(String(Number(balances) + Number(depositAmount)));
          balances[0] = String(Number(balances) + Number(depositAmount));
          setValidated(false);
          handleShowSuccess();
        }
      }
      
  const balances = useBalances(provider, accounts, tokenContract);
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Deposit
      </Button>
      <Modal
          show={show}
          onHide={handleClose}
          centered
          keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Deposit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
            >
            <Form.Group controlId="ticketPrice">
                <Form.Label>Ticket price (in TIK)</Form.Label>
                <Form.Control 
                    type="number"
                    step="0.001"
                    placeholder="Ticket price"
                    onChange={validateDepositAmount}
                    value={depositAmount}
                    required
                    min="0.001"
                    max="100"
                />
                <Form.Control.Feedback type="invalid">
                    Minimum deposit is 0.001 Tik.
                </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Deposit
                </Button>
            </Form>
          <p
          style ={{
            fontSize: "16px",
            fontFamily: "monospace",
            fontWeight: "bold"
          }}
          >
            Balance after deposit : {(Number(balances) + Number(depositAmount))} TIK (ETH:TIK - 1:1)
          </p>
        </Modal.Body>
        </Modal>

        <Modal
          show={showSuccess}
          onHide={handleCloseSuccess}
          centered
          keyboard={false}
        >
        <Modal.Header closeButton>
          <Modal.Title>Sucessfull deposit</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column align-items-center">
              <p>
                You have successfully deposited {depositAmount} TIK.
              </p>
              <Button variant="primary" onClick={handleCloseSuccess}>
                  Continue
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    )
}

export default Deposit;