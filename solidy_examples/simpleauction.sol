pragma solidity ^0.4.0;

contract SimpleAuction {
    
    // 
    address public beneficiary;

    // unix/epoch timestamp starting from 1970-01-01
    uint public auctionEnd;

    // highest bid
    address public highestBidder;

    uint public highestBid;

    mapping(address => uint) pendingReturns;

    // Set to true at the end to disallow any change
    bool ended;

    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnd(address winner, uint amount);

    /// Create a simple auction with `_biddingTime` seconds bidding time on behalf of the
    /// beneficiary address `_beneficiary`
    function SimpleAuction(uint _biddingTime, address _beneficiary) public {
        beneficiary = _beneficiary;
        auctionEnd = now + _biddingTime;
    }

    /// Bid on the auction with the value sent together with this transaction.
    /// The value will only be refunded if the auction is not won.
    function bid() public payable {
        // the keyword payable is required for the function to be able to receive Ehter.
        // The Ether sent is automatically included as part of the tx, no need to define any input arguments.
  
        // auction has not expired
        require(now <= auctionEnd);

        // If the bid is not higher, send the money back
        require(msg.value > highestBid);

        if (highestBidder != address(0)) {
            // Don't do this `highestBidder.send(highestBid)`. Accumulate the returns and deal with it
            // later to avoid security risk by executing an untrusted contract, etc.
            pendingReturns[highestBidder] += highestBid;
        }

        // The bid is the highest so far, let's update the highest bidder info
        highestBidder = msg.sender;
        highestBid = msg.value;
        // fire off event after rcv the highest bid
        HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
           pendingReturns[msg.sender] = 0;
            if (!msg.sender.send(amount)) {
                // No need to call throw here, just reset the amount owing
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    /// End the auction and send the highest bid to the beneficiary.
    function auctionEnd() public {
        require(now >= auctionEnd);
        require(!ended);

        ended = true;
        AuctionEnd(highestBidder, highestBid);
        beneficiary.transfer(highestBid);
    }

}