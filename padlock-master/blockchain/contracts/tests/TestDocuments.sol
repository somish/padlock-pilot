pragma solidity >0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;
//SPDX-License-Identifier: UNLICENSED

import { Documents, Document } from '../libraries/Documents.sol';

/**
 * Padlock v0.1.0 Documents Library Testing
 * Author: Blox Consulting LLC
 * Last Updated: 07.17.2020
 *
 * Testing for Documents storage
 */
contract TestDocuments {
  /// LIBRARIES ///
  using Documents for Document;

  /// EVENTS ///
  event DocumentAdded(address _by, uint256 _index);

  // Documents //
  uint256 public documentIndex;
  mapping(uint256 => Document) public documents;

  /// MUTABLE FUNCTIONS ///

  /**
   * Ensure that new documents can be initalized containing the correct info
   * @param _title bytes a sha3 hash of the file title
   * @param _hash a sha3 hash of the file
   * --base64 encoded
   * @return _index uint the index of the document within the testing contract
   */
  function testInit(bytes memory _title, bytes memory _hash) public returns (uint256 _index) {
    documents[++documentIndex].initialize(_title, _hash);
    _index = documentIndex;
    Document memory document = documents[_index];
    require(keccak256(document.title) == keccak256(_title), 'Title incorrectly set!');
    require(keccak256(document.docHash) == keccak256(_hash), 'Body incorrectly set!');
    require(document.op == msg.sender, 'Original Poster incorrectly set!');
    require(document.init, 'Initialization status incorrectly set!');
    require(document.timestamp != 0, 'Timestamp incorrectly set!');
    emit DocumentAdded(msg.sender, _index);
    return documentIndex;
  }
}
