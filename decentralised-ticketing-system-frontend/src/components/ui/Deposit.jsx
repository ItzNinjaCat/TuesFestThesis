import { ethers } from 'ethers';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React, { useState, useEffect } from 'react';


function Deposit() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
          <div>
          <form >
            <input
              type="number"
              step="0.1"
              placeholder="Deposit Amount"
              // value = {}
              // onChange={this.updateDeposit}
              style = {{
                borderRadius : "8px",
                margin : "8px"
              }}
              min="0"
              />
            <Button children = "Deposit" type="submit"/>
          </form>
          <p
          style ={{
            fontSize: "16px",
            fontFamily: "monospace",
            fontWeight: "bold"
          }}
          >
            Balance after deposit : {} TIK (ETH:TIK - 1:1)
          </p>
          </div>
        </Modal.Body>
        </Modal>
      </>
    )
}

export default Deposit;