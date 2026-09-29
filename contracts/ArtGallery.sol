// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ArtGallery - one-of-one artworks acquired with ETH.
/// Each artwork can be acquired once; the buyer address is stored on-chain as provenance.
contract ArtGallery {
    address public owner;
    uint256 public count;

    struct Work { uint256 price; address buyer; }
    mapping(uint256 => Work) public works; // id starts at 1

    event Listed(uint256 indexed id, uint256 price);
    event Acquired(uint256 indexed id, address indexed buyer, uint256 price);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    constructor() { owner = msg.sender; }

    /// Owner lists new works; ids are assigned sequentially (1, 2, 3 ...).
    function list(uint256[] calldata prices) external onlyOwner {
        for (uint256 i = 0; i < prices.length; i++) {
            require(prices[i] > 0, "price 0");
            count++;
            works[count] = Work(prices[i], address(0));
            emit Listed(count, prices[i]);
        }
    }

    /// Acquire one or many works in a single payment (the "collection" checkout).
    function acquire(uint256[] calldata ids) external payable {
        uint256 total;
        for (uint256 i = 0; i < ids.length; i++) {
            Work storage w = works[ids[i]];
            require(w.price > 0, "unknown work");
            require(w.buyer == address(0), "already acquired");
            w.buyer = msg.sender;
            total += w.price;
            emit Acquired(ids[i], msg.sender, w.price);
        }
        require(msg.value == total, "wrong value");
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }
}
