pragma solidity >0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;
//SPDX-License-Identifier: UNLICENSED

import '../../node_modules/@openzeppelin/contracts/math/SafeMath.sol';
import '../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { Tasks, Task } from '../libraries/Tasks.sol';
import { Agreements, Agreement } from '../libraries/Agreements.sol';
import { Documents, Document } from '../libraries/Documents.sol';

/**
 * Padlock v0.1.0 Deployable Project Escrow Contract Interface
 * Author: Blox Consulting LLC
 * Last Updated: 07.20.2020
 *
 * Interface for child contract from Padlock service contract; escrows all funds
 * Use task library to store hashes of data within project
 */
abstract contract IProject {
  /// LIBRARIES///

  using SafeMath for uint256;
  using Tasks for Task;
  using Agreements for Agreement;
  using Documents for Document;

  /// EVENTS ///

  event ProjectFunded(uint256 _funded);
  event EscrowReleased(uint256 _phase);
  event TaskCreated(uint256 _index);
  event SubcontractorInvited(uint256 _index, address _sc);
  event SubcontractorSwapped(uint256 _index, address _old, address _new);
  event SubcontractorConfirmed(uint256 _index);
  event TaskFunded(uint256 _index);
  event TaskActive(uint256 _index);
  event DocumentAdded(uint256 _task, uint256 _document);
  event PurchaseOrderDesignated(uint256 _index); //task index
  event LienReleaseDesignated(uint256 _index); //task index
  event TaskPending(uint256 _index);
  event TaskComplete(uint256 _index);

  /// MODIFIERS ///

  modifier onlyPadlock() {
    require(msg.sender == padlock, 'Method can only be called by Padlock Factory Contract!');
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Method can only be called by the project owner!');
    _;
  }

  modifier onlyGC() {
    require(msg.sender == gc, 'Method can only be called by the project general contractor!');
    _;
  }

  modifier onlySC(uint256 _task) {
    require(tasks[_task].subcontractor == msg.sender, 'Method can only be called by a subcontractor on this task!');
    _;
  }

  modifier onlyFunded() {
    require(funded, 'Cannot perform this action before the GC Fees are funded!');
    _;
  }

  /// VARIABLES ///

  // Permissions //
  address public padlock;
  address public owner;
  address public gc;

  // Escrow //
  bool public funded;
  uint public feesLength;
  mapping(uint256 => uint256) public fees;
  mapping(uint256 => bool) public paid;
  IERC20 PUSD;

  // Task Data //
  uint256 taskSerial;
  mapping(uint256 => Task) public tasks;
  mapping(uint256 => mapping(uint256 => Document)) public documents;
  mapping(uint256 => Agreement[2]) public agreements;

  /// MUTABLE FUNCTIONS ///

  // Project-Specific //

  /**
   * Mark a project's gc funding as true to reflect ecr20 transfer in call stack
   * @dev modifier onlyPadlock
   */
  function fundProject() public virtual;

  /**
   * Pay a general contractor's fee for a given phase
   * @dev modifier onlyOwner
   * @param _phase the phase to pay out
   */
  function releaseFeeEscrow(uint256 _phase) public virtual;

  // Task-Specific //

  /**
   * Create a new task in this project
   * @dev modifier onlyGC
   * @param _title bytes: the sha3 hash of the task titile
   * @param _cost uint: the number of pusd tokens required to escrow this contract
   * @param _sc address: the subcontractor being invited (OPTIONAL, send address(0) if none)
   * @return _index uint: the index of the newly created task within the project
   */
  function createTask(bytes memory _title, uint256 _cost, address _sc) public virtual returns (uint256 _index);

  /**
   * Move a specified task to the 'active' phase
   * @dev modifier onlyGC
   * @param _index uint: the task index within the project contract
   */
  function setActive(uint256 _index) public virtual;

  /**
   * Accept a designated Lien Release document and release escrow for a task
   * @dev modifier onlyGC
   * @param _index uint the idnex of the task within
   */
  function setPending(uint256 _index) public virtual;

  /**
   * Mark a task as complete
   * @dev modifier onlyGC
   * @param _index uint serial of the task being set to complete
   */
  function setComplete(uint256 _index) public virtual;

  /**
   * Invite a subcontractor to a given task
   * @dev modifier onlyGC
   * @param _index uint: the index of the task the sc is invited to
   * @param _to address: the address of the subcontractor being invited
   */
  function inviteSubcontractor(uint256 _index, address _to) public virtual;

  /**
   * Accept an invite to a given task
   * @dev modifier onlySC
   * @param _index uint: the index of the task being joined
   */
  function acceptInvite(uint256 _index) public virtual;

  /**
   * Finance a task
   * @dev modifier onlyPadlock
   * @param _index uint: the index of the task being financed
   */
  function fundTask(uint256 _index) public virtual;

  /**
   * Designate an existing document as a lien release, then propose it to GC to ratify
   * @dev modifier onlySC
   * @param _index uint the task serial pointing to storage of the lien release
   * @param _docIndex the index of the document within the task being proposed as the lien release
   */
  function designateLienRelease(uint256 _index, uint256 _docIndex) public virtual;

  /**
   * Add a new document to a task
   * @param _index uint the index of the task within the project contract
   * @param _title bytes the sha3 hash of the task title
   * @param _body bytes the sha3 hash of the taks body
   */
  function addDocument(
    uint256 _index,
    bytes memory _title,
    bytes memory _body
  ) public virtual returns (uint256 _docIndex);

  /// VIEWABLE METHODS ///

  /**
   * Get the data associated with a document,
   * @param _index uint the index of the task within the project contract
   * @param _docIndex uint the index of the document within the task
   * @return _timestamp UNIX timecode of when the document was recieved on Ethereum
   * @return _hash bytes the body of a document
   * @return _title bytes the title of a document
   */
  function getDocument(uint256 _index, uint256 _docIndex)
    public
    virtual
    view
    returns (
      uint256 _timestamp,
      bytes memory _hash,
      bytes memory _title
    );

  
  /**
   * Recover lifecycle alerts from a task
   * @param _index uint the index of the task within the project contract
   * @return _alerts bool[4] array of alert statuses
   */
  function getAlerts(uint256 _index) public virtual view returns (bool[4] memory _alerts);

  /**
   * return the numerical encoding of a task's state
   * @param _index uint the index of the task within the project contract
   * @return _state uint the state of the task
   */
  function getState(uint256 _index) public virtual view returns (uint256 _state);

  /**
   * Get the cost of a specific task
   * @param _index uint the index of the task being queried within the project contract
   * @return _cost uint the PUSD cost to be escrowed/ already escrowed in the contract
   */
  function getCost(uint256 _index) public virtual view returns (uint256 _cost);

  /**
   * Get the cost of a GC's Fees
   * @return _cost uint the sum of all fees across all phases
   */
  function projectCost() public virtual view returns (uint256 _cost);

  /**
   * Get the status of a phase's general contractor fees
   * @param _phase uint the phase being queried 
   * @return _cost uint the cost of the phase being paid to the gc
   * @return _paid true if the owner has released escrow, and false otherwise
   */
  function feeByPhase(uint _phase) public virtual view returns (uint _cost, bool _paid);
}
