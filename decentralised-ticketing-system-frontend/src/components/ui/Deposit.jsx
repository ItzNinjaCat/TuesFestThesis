import { ethers } from 'ethers';
import { Button, Modal, Form } from 'react-bootstrap';
import React, { useState } from 'react';
import { useWeb3Context } from '../../hooks/useWeb3Context';

function Deposit() {
  const [validated, setValidated] = useState(false);
  const [show, setShow] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const { contract, balance, setBalanceUpdate } = useWeb3Context();
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setDepositAmount(0);
  };
  const handleShowSuccess = () => setShowSuccess(true);
  const validateDepositAmount = e => {
    const value = Number(e.target.value);
    if (value < 0 && value > -100) {
      e.target.value = -Number(e.target.value);
    } else if (value < -100 || value > 100) {
      e.target.value = 100;
    }
    setDepositAmount(e.target.value);
  };

  const handleSubmit = async e => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
    } else {
      e.preventDefault();
      setValidated(true);
      const amount = ethers.utils.parseEther(depositAmount);
      const tx = await contract.deposit({ value: amount });
      handleClose();
      await tx.wait();
      setValidated(false);
      setBalanceUpdate(true);
      handleShowSuccess();
    }
  };
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Deposit
      </Button>
      <Modal show={show} onHide={handleClose} centered keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Deposit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mt-b alert alert-info">
            Balance after deposit : {Number(balance) + Number(depositAmount)} TIK (ETH:TIK - 1:1)
          </p>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="ticketPrice">
              <Form.Label>Deposit amount (in TIK)</Form.Label>
              <Form.Control
                type="number"
                step="0.001"
                placeholder="Deposit amount"
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
            <div className="d-flex justify-content-center">
              <Button className="mt-3" variant="primary" type="submit">
                Deposit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showSuccess} onHide={handleCloseSuccess} centered keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Sucessfull deposit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column align-items-center">
            <p>You have successfully deposited {depositAmount} TIK.</p>
            <Button variant="primary" onClick={handleCloseSuccess}>
              Continue
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Deposit;
