pragma solidity >0.4.0 <0.7.0;

//SPDX-License-Identifier: UNLICENSED

/**
 * Padlock v0.1.0 Task Library
 * Author: Blox Consulting LLC
 * Last Updated: 07.19.2020
 *
 * Library to execute a task's business logic and storage local to the project
 */
library Tasks {
  /// MODIFIERS ///
  modifier uninitialized(Task storage _self) {
    require(_self.state == TaskStatus.None, 'Cannot operate on initialized Task!');
    _;
  }

  modifier onlyInactive(Task storage _self) {
    require(_self.state == TaskStatus.Inactive, 'Method reserved for Inactive tasks!');
    _;
  }

  modifier onlyActive(Task storage _self) {
    require(_self.state == TaskStatus.Active, 'Method reserved for Active tasks!');
    _;
  }

  modifier onlyPending(Task storage _self) {
    require(_self.state == TaskStatus.Pending, 'Method reserved for Payment Pending tasks!');
    _;
  }

  /// MUTABLE FUNCTIONS ///

  // Task Status Changing Functions //

  /**
   * Create a new Task object
   * @dev cannot operate on initialized tasks
   * @param _self Task the task struct being mutated
   * @param _title bytes sha3 hash of the document title
   * @param _cost uint the number of PUSD tokens to be escrowed in this contract
   */
  function initialize(
    Task storage _self,
    bytes memory _title,
    uint256 _cost
  ) public uninitialized(_self) {
    _self.title = _title;
    _self.cost = _cost;
    _self.state = TaskStatus.Inactive;
    _self.alerts[0] = true;
  }

  /**
   * Attempt to transition task state from Inactive to Active
   * @param _self Task the task whose state is being mutated
   */
  function setActive(Task storage _self) internal onlyInactive(_self) {
    // Prerequisites //
    bool taskFunded = _self.alerts[uint256(Lifecycle.TaskFunded)];
    require(taskFunded, 'Cannot activate without PUSD Escrow!');
    bool subcontractor = _self.alerts[uint256(Lifecycle.SCConfirmed)];
    require(subcontractor, 'Cannot activate without a confirmed Subcontractor!');

    // Set state/ lifecycle //
    _self.alerts[uint256(Lifecycle.None)] = true;
    _self.alerts[uint256(Lifecycle.TaskFunded)] = false;
    _self.alerts[uint256(Lifecycle.SCConfirmed)] = false;
    _self.state = TaskStatus.Active;
  }

  /**
   * Attempt to transition task state from Active to Payment Pending
   * @dev lien release signed in project
   * @param _self Task the task whose state is being mutated
   */
  function setPending(Task storage _self) internal onlyActive(_self) {
    // Prerequisites //
    bool LRAdded = _self.alerts[uint256(Lifecycle.LienReleaseAdded)]; //LR is shorthand for lien release within code
    require(LRAdded, 'Cannot set to pending without Lien Release!');

    // Set state/ lifecycle //
    _self.alerts[uint256(Lifecycle.LienReleaseAdded)] = false;
    _self.alerts[uint256(Lifecycle.None)] = true;
    _self.state = TaskStatus.Pending;
  }

  /**
   * Attempt to transition task state from Payment Pending to Complete
   * @param _self Task the task whose state is being mutated
   */
  function setComplete(Task storage _self) internal onlyPending(_self) {
    // State/ Lifecycle //
    _self.state = TaskStatus.Complete;
  }

  // Subcontractor Joining //

  /**
   * Invite a subcontractor to the task
   * @param _self Task the task being joined by subcontractor
   * @param _sc address the subcontractor being invited
   */
  function inviteSubcontractor(Task storage _self, address _sc) internal onlyInactive(_self) {
    require(!_self.alerts[uint256(Lifecycle.SCConfirmed)], 'Cannot change subcontractor once confirmed!');
    _self.subcontractor = _sc;
  }

  /**
   * As a subcontractor, accept an invitation to participate in a task.
   * @param _self Task the task being joined by subcontractor
   */
  function acceptInvitation(Task storage _self) internal onlyInactive(_self) {
    // Prerequisites //
    require(_self.subcontractor == msg.sender, 'Can only join if invited!');
    require(!_self.alerts[uint256(Lifecycle.SCConfirmed)], 'Cannot change subcontractor once confirmed!');

    // State/ lifecycle //
    _self.alerts[uint256(Lifecycle.SCConfirmed)] = true;
    if (_self.alerts[uint256(Lifecycle.None)])
      _self.alerts[uint256(Lifecycle.None)] = false;
  }

  // Task Funding //

  /**
   * Set a task as funded
   * @dev modifier onlyAdmin
   * @param _self Task the task being set as funded
   */
  function fundTask(Task storage _self) internal onlyInactive(_self) {
    // Prerequisites //
    require(!_self.alerts[uint256(Lifecycle.TaskFunded)], 'Cannot fund task that has already been funded!');

    // State/ Lifecycle //
    _self.alerts[uint256(Lifecycle.TaskFunded)] = true;
    if (_self.alerts[uint256(Lifecycle.None)])
      _self.alerts[uint256(Lifecycle.None)] = false;
  }

  // Interaction //

  /**
   * Add a new document to a task by incrementing
   * Cross reference with documents mapping in projects
   * @dev document is stored in project
   * @param _self Task the task adding a document
   * @return _index uint the index of the document within the task
   */
  function addDocument(Task storage _self) internal returns (uint256 _index) {
    _index = ++_self.docIndex;
  }

  /**
   * Designate an existing document as the task's change order
   * @dev modifier onlyGC
   * @param _self Task the task designating a document internally as a purchase order
   * @param _index uint the index of the document within the task
   */
  function designatePurchaseOrder(Task storage _self, uint256 _index) internal onlyActive(_self) {
    // Prerequisites //
    require(_self.docIndex >= _index, 'Doc index out of bounds!');
    require(_self.purchaseOrderIndex == 0, 'Purchase order already defined!');

    // State/ lifecycle //
    _self.purchaseOrderIndex = _index;
  }

  /**
   * Designate an existing document as the task's lien release
   * @dev modifier onlySC
   * @dev Agreement signed in prjeoct
   * @param _self Task the task designating a lien release internally
   * @param _index uint the index of the document internally
   */
  function designateLienRelease(Task storage _self, uint256 _index) internal onlyActive(_self) {
    // Prerequisites //
    require(_self.docIndex >= _index, 'Doc index out of bounds!');
    require(!_self.alerts[uint256(Lifecycle.LienReleaseAdded)], 'Lien release already defined!');

    // State/ lifecycle //
    _self.alerts[uint256(Lifecycle.None)] = false;
    _self.alerts[uint256(Lifecycle.LienReleaseAdded)] = true;
    _self.lienReleaseIndex = _index;
  }

  /// VIEWABLE FUNCTIONS ///

  /**
   * Determine the current state of all alerts in the project
   * @param _self Task the task being queried for alert status
   * @return _alerts bool[4] array of bools representing whether Lifecycle alert has been reached
   */
  function getAlerts(Task storage _self) internal view returns (bool[4] memory _alerts) {
    for (uint256 i = 0; i < _alerts.length; i++)
      _alerts[i] = _self.alerts[i];
  }

  /**
   * Return the numerical encoding of the TaskStatus enumeration stored as state in a task
   * @param _self Task the task being queried for state
   * @return _state uint 0: none, 1: inactive, 2: active, 3: pending, 4: complete
   */
  function getState(Task storage _self) internal view returns (uint _state) {
    return uint(_self.state);
  }
}

//Task metadata
struct Task {
  // Metadata //
  bytes title;
  uint256 cost;
  address subcontractor;
  // Lifecycle //
  TaskStatus state;
  mapping(uint256 => bool) alerts;
  // Documents //
  uint256 lienReleaseIndex;
  uint256 purchaseOrderIndex;
  uint256 docIndex;
}

enum TaskStatus { None, Inactive, Active, Pending, Complete }

enum Lifecycle { None, TaskFunded, SCConfirmed, LienReleaseAdded }
