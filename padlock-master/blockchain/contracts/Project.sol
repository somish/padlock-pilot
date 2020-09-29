pragma solidity >0.4.0 <0.7.0;
//SPDX-License-Identifier: UNLICENSED

import './interfaces/IProject.sol';

/**
 * Padlock v0.1.0 Deployable Project Escrow Contract
 * Author: Blox Consulting LLC
 * Last Updated: 07.20.2020
 *
 * Project contract responsible for aggregating payments and data by/ for users on-chain
 */
contract Project is IProject {
  /**
   * Constructor for a padlock project contract
   * @param _owner address: the address of the owner hiring the gc
   * @param _gc address: the address of the gc managing the project
   * @param _pusd address: the address of the token being escrowed
   * @param _fees uint[] where each index represents payout from owner to gc for that phase
   */
  constructor(
    address _owner,
    address _gc,
    address _pusd,
    uint256[] memory _fees
  ) public {
    padlock = msg.sender;
    owner = _owner;
    gc = _gc;
    PUSD = IERC20(_pusd);
    feesLength = _fees.length;
    for (uint i = 0; i < feesLength; i++)
      fees[i] = _fees[i];
  }

  /// MUTABLE FUNCTIONS ///

  // Project-Specific //

  function fundProject() public override onlyPadlock {
    require(!funded, 'Fees have already been funded!');
    uint owed = projectCost();
    funded = true;
    emit ProjectFunded(owed);
  }

  function releaseFeeEscrow(uint256 _phase) public override onlyOwner {
    require(funded, 'Cannot pay fees until Administrator provides contract liquidity!');
    require(_phase < feesLength, 'Phase is out of bounds!');
    require(!paid[_phase], 'Phase has already been paid!');

    PUSD.transfer(gc, fees[_phase]);
    paid[_phase] = true;
    emit EscrowReleased(_phase);
  }

  // Task Specific //

  function createTask(bytes memory _title, uint256 _cost, address _sc) public override onlyGC returns (uint256 _serial) {
    _serial = ++taskSerial;
    tasks[_serial].initialize(_title, _cost);
    emit TaskCreated(_serial);
    if (_sc != address(0))
      inviteSubcontractor(_serial, _sc);
  }

  function setActive(uint256 _index) public override onlyGC onlyFunded() {
    tasks[_index].setActive();
    emit TaskActive(_index);
  }

  function setPending(uint256 _index) public override onlyGC {
    agreements[_index][1].sign();
    tasks[_index].setPending();
    PUSD.transfer(tasks[_index].subcontractor, tasks[_index].cost);
    emit TaskPending(_index);
  }

  function setComplete(uint256 _index) public override onlyGC {
    tasks[_index].setComplete();
    emit TaskComplete(_index);
  }

  function inviteSubcontractor(uint256 _index, address _to) public override onlyGC {
    address old = tasks[_index].subcontractor;
    tasks[_index].inviteSubcontractor(_to);
    if (old != address(0)) emit SubcontractorSwapped(_index, old, _to);
    else emit SubcontractorInvited(_index, _to);
  }

  function acceptInvite(uint256 _index) public override onlySC(_index) {
    tasks[_index].acceptInvitation();
    emit SubcontractorConfirmed(_index);
  }

  function fundTask(uint256 _index) public override onlyPadlock {
    tasks[_index].fundTask();
    emit TaskFunded(_index);
  }

  function designateLienRelease(uint256 _index, uint256 _docIndex) public override onlySC(_index) {
    tasks[_index].designateLienRelease(_docIndex);
    agreements[_index][1].initLienRelease(gc, msg.sender);
    agreements[_index][1].sign();
    emit LienReleaseDesignated(_index);
  }

  function addDocument(
    uint256 _index,
    bytes memory _title,
    bytes memory _body
  ) public override returns (uint256 _docIndex) {
    _docIndex = ++tasks[_index].docIndex;
    documents[_index][_docIndex].initialize(_title, _body);
    emit DocumentAdded(_index, _docIndex);
  }

  /// VIEWABLE METHODS ///

  function getDocument(uint256 _index, uint256 _docIndex)
    public
    override
    view
    returns (
      uint256 _timestamp,
      bytes memory _hash,
      bytes memory _title
    )
  {
    Document memory document = documents[_index][_docIndex];
    _timestamp = document.timestamp;
    _hash = document.docHash;
    _title = document.title;
  }

  function getAlerts(uint256 _index) public override view returns (bool[4] memory _alerts) {
    return tasks[_index].getAlerts();
  }

  function getState(uint256 _index) public override view returns (uint256 _state) {
    return tasks[_index].getState();
  }

  function getCost(uint256 _index) public override view returns (uint256 _cost) {
    return tasks[_index].cost;
  }

  function projectCost() public override view returns (uint256 _cost) {
    for (uint256 i = 0; i < feesLength; i++) _cost += fees[i];
  }

  function feeByPhase(uint _phase) public override view returns (uint _cost, bool _paid) {
    require(_phase < feesLength, "Query for phase is out of bounds!");
    _cost = fees[_phase];
    _paid = paid[_phase];
  }
}
