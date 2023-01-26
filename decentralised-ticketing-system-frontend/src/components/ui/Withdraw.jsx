import { ethers } from 'ethers';
import { Button, Modal, Form } from 'react-bootstrap';
import { useState, useContext } from 'react';
import { Web3Context } from '../App';
function Withdraw() {
    const [validated, setValidated] = useState(false);
    const [show, setShow] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const { contract, balance, setBalanceUpdate } = useContext(Web3Context);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setWithdrawAmount(0);
  };
  const handleShowSuccess = () => setShowSuccess(true);
  const validatewithdrawAmount = (e) => {
      const value = Number(e.target.value);
      if (value < 0 && value > -100) {
          e.target.value = -Number(e.target.value);
      }
      else if (value < -100 || value > 100) {
          e.target.value = 100;
      }
      setWithdrawAmount(e.target.value);
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
          const amount = ethers.utils.parseEther(withdrawAmount);
          const tx = await contract.userWithdraw(amount);
          handleClose();
          await tx.wait();
          setValidated(false);
          handleShowSuccess();
          setBalanceUpdate(true);
        }
      }
    return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Withdraw
      </Button>
      <Modal
          show={show}
          onHide={handleClose}
          centered
          keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Withdraw</Modal.Title>
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
                    placeholder="Withdraw amount"
                    onChange={validatewithdrawAmount}
                    value={withdrawAmount}
                    required
                    min="0.001"
                    max={balance === undefined? 0 : balance}
                />
                <Form.Control.Feedback type="invalid">
                    Minimum withdraw is 0.001 Tik.
                </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Withdraw
                </Button>
            </Form>
          <p
          style ={{
            fontSize: "16px",
            fontFamily: "monospace",
            fontWeight: "bold"
          }}
          >
            Balance after withdraw : {(Number(balance) - Number(withdrawAmount))} TIK (ETH:TIK - 1:1)
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
          <Modal.Title>Sucessfull withdraw</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column align-items-center">
              <p>
                You have successfully withdrawn {withdrawAmount} TIK.
              </p>
              <Button variant="primary" onClick={handleCloseSuccess}>
                  Continue
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </>

    );
}

export default Withdraw;
