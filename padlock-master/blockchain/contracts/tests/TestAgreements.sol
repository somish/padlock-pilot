pragma solidity >0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;
//SPDX-License-Identifier: UNLICENSED

import { Agreements, Agreement, AgreementType } from '../libraries/Agreements.sol';

/**
 * Padlock v0.1.0 Multisignature Agreements Library Testing
 * Author: Blox Consulting LLC
 * Last Updated: 07.17.2020
 *
 * Testing for multisignature agreements component
 */
contract TestAgreements {
  /// LIBRARIES ///
  using Agreements for Agreement;

  /// EVENTS ///
  event ChangeOrderAgreement(address _admin, address _owner, address _gc, address _sc);
  event LienReleaseAgreement(address _gc, address _sc);
  event AgreementSigned(address _by);

  // Agreements //
  uint256 public agreementIndex;
  mapping(uint256 => Agreement) public agreements;

  /// MUTABLE FUNCTIONS ///

  /**
   * Ensure that a multisignature agreement can be initialized for ChangeOrder status
   * @param _admin address the admin funding the task
   * @param _owner address the owner of the project of this task
   * @param _gc address the general contractor creating the task
   * @param _sc address the subcontractor participating in the task
   */
  function testInitChangeOrder(
    address _admin,
    address _owner,
    address _gc,
    address _sc
  ) public {
    agreements[++agreementIndex].initChangeOrder(_admin, _owner, _gc, _sc);
    Agreement memory agreement = agreements[agreementIndex];
    require((agreement.admin == _admin), 'Admin is not being set in initialization!');
    require((agreement.owner == _owner), 'Owner is not being set in initialization!');
    require((agreement.gc == _gc), 'General Contractor is not being set in initialization!');
    require((agreement.sc == _sc), 'Subcontractor is not being set in initialization!');
    require((agreement.kind == AgreementType.ChangeOrder), 'Agreement type is not being set in initialization!');
    require((agreement.threshold == 4), 'Agreement threshold is not being set in initialization!');
  }

  /**
   * Ensure that a multisignature agreement can be initialized for LienRelease status
   * @param _gc address the general contractor creating the task
   * @param _sc address the subcontractor participating in the task
   */
  function testInitLienRelease(address _gc, address _sc) public {
    agreements[++agreementIndex].initLienRelease(_gc, _sc);
    Agreement memory agreement = agreements[agreementIndex];
    require((agreement.gc == _gc), 'General Contractor is not being set in initialization!');
    require((agreement.sc == _sc), 'Subcontractor is not being set in initialization!');
    require((agreement.kind == AgreementType.LienRelease), 'Agreement type is not being set in initialization!');
    require((agreement.threshold == 2), 'Agreement threshold is not being set in initialization!');
  }

  /**
   * Ensure an agreement can be signed by its participants
   * @param _index uint the index of the agreement being signed
   * @return _nonce uint the number of signatures recieved by the agreement at that index
   */
  function testSign(uint256 _index) public returns (uint256 _nonce) {
    uint256 pre = agreements[_index].nonce;
    agreements[_index].sign();
    _nonce = agreements[_index].nonce;
    require((pre + 1 == _nonce), 'Nonce has not updated after signing!');
  }

  /// VIEWABLE FUNCTIONS ///

  /**
   * Ensure an agreement returns the correct resolved status
   * @param _index uint the index of the agreement being signed
   * @return true if the Agreement at a given index is resolved, and false otherwise
   */
  function testResolved(uint256 _index) public view returns (bool) {
    bool expected = agreements[_index].nonce == agreements[_index].threshold;
    bool actual = agreements[_index].resolved();
    require(expected == actual, 'Resolved not reflecting correct state of Agreement!');
    return actual;
  }

  /**
   * Ensure contract can dertermine whether an Agreement has been signed by a given address
   * @param _index uint the index of the agreeement struct being queried
   * @param _by address the address being queried for signature submission status
   * @return true if _by has signed the agreement, and false otherwise
   */
  function testHasSigned(uint256 _index, address _by) public view returns (bool) {
    return agreements[_index].signed[_by];
  }

  /**
   * Ensure contract can dertermine whether an Agreement can be signed by a given address
   * @param _index uint the index of the agreeement struct being queried
   * @param _by address the address being queried for signature authorization status
   * @return true if _by can sign the agreement, and false otherwise
   */
  function testIsSigner(uint256 _index, address _by) public view returns (bool) {
    return agreements[_index].signer[_by];
  }
}
