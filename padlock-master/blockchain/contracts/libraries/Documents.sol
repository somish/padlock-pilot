pragma solidity >0.4.0 <0.7.0;

//SPDX-License-Identifier: UNLICENSED

/**
 * Padlock v0.1.0 Document Library
 * Author: Blox Consulting LLC
 * Last Updated: 07.17.2020
 *
 * Library to compartmentalize document storage and retrieval mechanisms
 * @dev mainly structures creation, will be more robust tools in future most likely
 */
library Documents {
  /// MODIFIERS ///

  modifier uninitialized(Document storage _self) {
    require(!_self.init, 'Cannot operate on initialized Document!');
    _;
  }

  /// MUTABLE FUNCTIONS ///

  /**
   * Initalize a Document struct with data
   * @param _self Document: the document struct being initialized
   * @param _title bytes: sha3 hash of the title of the document
   * @param _hash bytes: the sha3 hash of the actual file
   * @return _timestamp uint: the UNIX encoding of the time of posting on-chain
   **/
  function initialize(
    Document storage _self,
    bytes memory _title,
    bytes memory _hash
  ) internal uninitialized(_self) returns (uint256 _timestamp) {
    _self.init = true;
    _self.title = _title;
    _self.op = msg.sender;
    _self.docHash = _hash;
    _timestamp = now;
    _self.timestamp = _timestamp;
  }
}

//Document metadata
struct Document {
  bool init;
  bytes title;
  address op;
  bytes docHash;
  uint256 timestamp;
}
