pragma solidity >0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;
//SPDX-License-Identifier: UNLICENSED

import { Tasks, Task, TaskStatus, Lifecycle } from '../libraries/Tasks.sol';
import { Documents, Document } from '../libraries/Documents.sol';
import { Agreements, Agreement } from '../libraries/Agreements.sol';

/**
 * Padlock v0.1.0 Task Library Testing
 * Author: Blox Consulting LLC
 * Last Updated: 07.20.2020
 *
 * Testing for Task logic and data storage
 * Includes events used in project as well
 */
contract TestTasks {
  /// LIBRARIES ///
  using Tasks for Task;

  /// EVENTS ///
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

  // Documents //
  uint256 public taskIndex;
  mapping(uint256 => Task) public tasks;

  /**
   * Ensure that a task can be initialized
   * @param _title bytes the sha3 hash of the task title
   * @param _cost uint the cost of the task
   * @return _index uint the index of the new task within the test contract
   */
  function testInitialize(bytes memory _title, uint256 _cost) public returns (uint256 _index) {
    _index = ++taskIndex;
    tasks[taskIndex].initialize(_title, _cost);
    Task memory task = tasks[taskIndex];
    require(keccak256(task.title) == keccak256(_title), 'Task title is not being set correctly!');
    require(task.cost == _cost, 'Task cost is not being set correctly!');
    require(task.state == TaskStatus.Inactive, 'Task state is not being set correctly');
    emit TaskCreated(_index);
  }

  /**
   * Ensure that a task can transition from inactive state to active state
   * @param _index uint the index of the task within the test contract
   */
  function testSetActive(uint256 _index) public {
    tasks[_index].setActive();
    Task storage task = tasks[_index];
    require(task.state == TaskStatus.Active, 'Task state not being set correctly!');
    emit TaskActive(_index);
  }

  /**
   * Ensure that a task can transition from active state to payment pending state
   * @param _index uint the index of the task within the test contract
   */
  function testSetPending(uint256 _index) public {
    tasks[_index].setPending();
    Task storage task = tasks[_index];
    require(task.state == TaskStatus.Pending, 'Task state not being set correctly!');
    emit TaskPending(_index);
  }

  /**
   * Ensure that a task can transition from pending state to complete state
   * @param _index uint the index of the task within the test contract
   */
  function testSetComplete(uint256 _index) public {
    tasks[_index].setComplete();
    Task storage task = tasks[_index];
    require(task.state == TaskStatus.Complete, 'Task state not being set correctly!');
    emit TaskComplete(_index);
  }

  // Subcontractor Joining //

  /**
   * Ensure that a subcontractor can be invited to a task
   * @param _index uint the index of the task within the testing contract
   * @param _sc address the subcontractor being invited
   */
  function testInviteSubcontractor(uint256 _index, address _sc) public {
    address old = tasks[_index].subcontractor;
    tasks[_index].inviteSubcontractor(_sc);
    require(tasks[_index].subcontractor == _sc, 'Subcontractor not being set during invitation!');
    if (old != address(0)) emit SubcontractorSwapped(_index, old, _sc);
    else emit SubcontractorInvited(_index, _sc);
  }

  /**
   * Ensure that a subcontractor can accept an invitation to participate in a task
   * @param _index uint the index of the task within the testing contract
   */
  function testAcceptInvitation(uint256 _index) public {
    tasks[_index].acceptInvitation();
    require(tasks[_index].alerts[uint256(Lifecycle.SCConfirmed)], 'SCConfirmed Alert not being set correctly!');
    emit SubcontractorConfirmed(_index);
  }

  // Task Funding //

  /**
   * Ensure that a task can be set to funded state internally
   * @param _index uint the index of the task within the testinc contract
   */
  function testFundTask(uint256 _index) public {
    tasks[_index].fundTask();
    require(tasks[_index].alerts[uint256(Lifecycle.TaskFunded)], 'TaskFunded Alert not being set correctly!');
    emit TaskFunded(_index);
  }

  // Interaction //
 
  /**
   * Ensure that a document can be added to a task
   * @param _index uint the index of the task within the testing contract
   * @return _docIndex uint the index of the document within the task
   */
  function testAddDocument(uint256 _index) public returns (uint256 _docIndex) {
    uint256 before = tasks[_index].docIndex;
    _docIndex = tasks[_index].addDocument();
    require(tasks[_index].docIndex == before + 1, 'Doc index not incrementing!');
    emit DocumentAdded(_index, _docIndex);
  }

  /**
   * Ensure that a document index can be designated as a purchase order within a task
   * @param _index uint the index of the task within the testing contract
   * @param _docIndex uint the index of the document within the task
   */
  function testDesignatePurchaseOrder(uint256 _index, uint256 _docIndex) public {
    tasks[_index].designatePurchaseOrder(_docIndex);
    require(tasks[_index].purchaseOrderIndex == _docIndex, 'PO index not being set correctly in task!');
    emit PurchaseOrderDesignated(_index);
  }

  /**
   * Ensure that a subcontractor can designate a document index as a lien release
   * @dev modifier onlySC
   * @param _index uint the index of the task within the testing contract
   * @param _docIndex uint the index of the document within the task
   */
  function testDesignateLienRelease(uint256 _index, uint256 _docIndex) public {
    tasks[_index].designateLienRelease(_docIndex);
    require(tasks[_index].lienReleaseIndex == _docIndex, 'Lien Release Document Index not set correctly!');
    require(tasks[_index].alerts[uint256(Lifecycle.LienReleaseAdded)], 'Lien Release Alert not set correctly!');
    emit LienReleaseDesignated(_index);
  }

  /// VIEWABLE FUNCTIONS ///

  /**
   * Ensure that the lifecycle alerts can be recovered from a task
   * @param _index uint the index of the task within the testing contract
   * @return _alerts bool[4] array of alert statuses
   */
  function testGetAlerts(uint256 _index) public view returns (bool[4] memory _alerts) {
    return tasks[_index].getAlerts();
  }

  /**
   * Ensure that a task can return the numerical encoding of its state
   * @param _index uint the index of the task within the testing contract
   * @return _state uint the state of the task
   */
  function testGetState(uint _index) public view returns (uint _state) {
    return tasks[_index].getState();
  }
}
