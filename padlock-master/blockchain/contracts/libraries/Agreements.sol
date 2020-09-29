pragma solidity >0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;

//SPDX-License-Identifier: UNLICENSED

/**
 * Padlock v0.1.0 Multisignature Agreement Library
 * Author: Blox Consulting LLC
 * Last Updated: 07.17.2020
 *
 * Library to compartmentalize multisignature logic with Padlock's four roles
 */
library Agreements {
  /// EVENTS ///

  event ChangeOrderAgreement(address _admin, address _owner, address _gc, address _sc);
  event LienReleaseAgreement(address _gc, address _sc);
  event AgreementSigned(address _by);

  /// MODIFIERS ///

  modifier onlySigner(Agreement storage _self) {
    require(_self.signer[msg.sender], 'Only predefined signers can participate in this agreement!');
    _;
  }

  modifier uninitialized(Agreement storage _self) {
    require(_self.kind == AgreementType.None, 'Cannot operate on initialized Agreement!');
    _;
  }

  /// MUTABLE FUNCTIONS ///

  // Agreement Initialization //

  /**
   * Initialize an agreement as a change order sequence
   * @param _admin address the Padlock service contract
   * @param _owner address the owner account
   * @param _gc address the general contractor account
   * @param _sc address the subcontractor account
   */
  function initChangeOrder(
    Agreement storage _self,
    address _admin,
    address _owner,
    address _gc,
    address _sc
  ) internal {
    //Agreement metadata
    _self.kind = AgreementType.ChangeOrder;
    _self.threshold = 4;

    //Agreement Signers
    _self.signer[_admin] = true;
    _self.signer[_owner] = true;
    _self.signer[_gc] = true;
    _self.signer[_sc] = true;

    //Agreement Roles
    _self.admin = _admin;
    _self.owner = _owner;
    _self.gc = _gc;
    _self.sc = _sc;

    emit ChangeOrderAgreement(_admin, _owner, _gc, _sc);
  }

  /**
   * Initialize an agreement as a lien release check sequence
   * @param _gc address the general contractor account
   * @param _sc address the subcontractor account
   */
  function initLienRelease(
    Agreement storage _self,
    address _gc,
    address _sc
  ) internal {
    //Agreement metadata
    _self.kind = AgreementType.LienRelease;
    _self.threshold = 2;

    //Agreement Signers
    _self.signer[_gc] = true;
    _self.signer[_sc] = true;

    //Agreement Roles
    _self.gc = _gc;
    _self.sc = _sc;

    emit LienReleaseAgreement(_gc, _sc);
  }

  // Signature //

  /**
   * Sign a multisignature agreement
   * @param _self the agreement struct being mutated
   * @return _nonce uint number of signatures recieved
   */
  function sign(Agreement storage _self) internal onlySigner(_self) returns (uint256 _nonce) {
    require(!_self.signed[msg.sender], 'Cannot sign an agreement twice!');

    _self.signed[msg.sender] = true;
    _self.nonce += 1;
    emit AgreementSigned(msg.sender);
    return _self.nonce;
  }

  /// VIEWABLE FUNCTIONS ///

  /**
   * Determine whether a multisignature agreement can be considered resolved
   * @param _self Agreement the struct being evaluated
   * @return bool true if all signers have approved, and false otherwise
   */
  function resolved(Agreement storage _self) internal view returns (bool) {
    return (_self.nonce == _self.threshold);
  }

  /**
   * Determine whether or not an Agreement has been signed by a given address
   * @param _self Agreement the agreeement struct being mutated
   * @param _by address the address being queried for signature submission status
   * @return true if _by has signed the agreement, and false otherwise
   */
  function hasSigned(Agreement storage _self, address _by) internal view returns (bool) {
    return _self.signed[_by];
  }

  /**
   * Determine whether or not an Agreement has a given address as a signer
   * @param _self Agreement the agreeement struct being mutated
   * @param _by address the address being queried for signature authorization status
   * @return true if _by is allowed to sign the agreement, and false otherwise
   */
  function isSigner(Agreement storage _self, address _by) internal view returns (bool) {
    return _self.signer[_by];
  }
}

// Multisig Agreement metadata
struct Agreement {
  AgreementType kind; //the kind of Agreement as enumerated in AgreementType
  address admin;
  address owner;
  address gc;
  address sc;
  mapping(address => bool) signer; //whether an address is allowed to sign the agreement
  mapping(address => bool) signed; //whether an address has signed the agreement
  uint256 threshold; //number of signatures required
  uint256 nonce; //number of signatures recieved
}

enum AgreementType { None, ChangeOrder, LienRelease }
