pragma solidity ^0.4.0;

/// @title Voting with delegation.
contract Ballot {

    // A struct for a single `Proposal`
    struct Proposal {
        bytes32 name; // Proposal name up to 32 bytes
        uint64 voteCount; // accumulated vote counts
    }

    // A single `Voter` struct.
    struct Voter {
        uint64 weight; // accumulated by delegation 
        bool voted; // determine if the voter has voted or not
        uint vote; // INDEX of the voted Proposal
        address delegate; // person delegated to
    }

    address public chairperson;

    // Stores a Voter struct for each possible address
    mapping(address => Voter) public voters;

    // a dynamically sized array of Proposal struct
    Proposal[] public proposals;

    /// Create a new ballot for each proposals with name `proposalNames`
    function Ballot(bytes32[] proposalNames) public {
        chairperson = msg.sender;
        voters[chairperson].weight = 1; // default vote weight is 1, fixed
        
        for (uint i = 0; i < proposalNames.length; i++) {
            // Create a temp Proposal struct and append to the end of proposals array
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // Give `toVoter` the right to vote on this ballot.
    // May only be called by `chairperson`.
    function giveRightToVote(address toVoter) public {
        if (msg.sender == chairperson && !voters[toVoter].voted && (voters[toVoter].weight == 0)) {
            voters[toVoter].weight = 1;
        }
    }

    /// Delegate your vote to the voter `to`.
    function delegate(address to) public {
        // this assigns `sender` as a reference to `voters[msg.sender]`
        Voter storage sender = voters[msg.sender]; // assigns reference
        // require(!sender.voted);
        if (sender.voted) {
            return;
        }
        
        // self-delegation is not allowed
        // require(to != msg.sender);
        if (to == msg.sender) {
            return;
        }

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            require(to != msg.sender);
        }
        sender.voted = true;
        sender.delegate = to;
        // Pass it on to the next delegate (block chain concept)
        Voter storage delegateTo = voters[to];
        if (delegateTo.voted) {
            proposals[delegateTo.vote].voteCount += sender.weight;
        } else {
            delegateTo.weight += sender.weight;
        }
    }

    /// Give your vote including delegated vote to you to the proposal `proposals[toProposal]`.
    function vote(uint toProposal) public {
        Voter storage sender = voters[msg.sender];
        if (sender.voted) {
            return;
        }
        sender.voted = true;
        sender.vote = toProposal;
        // According to Solidity doc, if the index is out of range, it will automatically 
        // throw (fail) and revert all changes.
        proposals[toProposal].voteCount += sender.weight;
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view returns (uint _winningProposal) {
        // use larger uint here since we may have a lot of voters, billion and trillions, etc.
        // this is million+ times more than the population on earth.
        uint64 winningVoteCount = 0;

        for (uint prop = 0; prop < proposals.length; prop++) {
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                _winningProposal = prop;
            }
        }
    }

    function winnerName() public view returns (bytes32 _winnerName) {
        _winnerName = proposals[winningProposal()].name;
    }
}
