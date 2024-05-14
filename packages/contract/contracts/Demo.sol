import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";

contract Demo {
    error InvalidSpender(address spender);

    IAllowanceTransfer public immutable permit2;

    constructor(address _permit2) {
        permit2 = IAllowanceTransfer(_permit2);
    }

    function permitThroughPermit2(
        IAllowanceTransfer.PermitSingle calldata permitSingle,
        bytes calldata signature
    ) public {
        if (permitSingle.spender != address(this)) revert InvalidSpender(permitSingle.spender);
        permit2.permit(msg.sender, permitSingle, signature);
    }

    function transferToOther(
        address token,
        uint160 amount,
        address recipient
    ) public {
        permit2.transferFrom(msg.sender, recipient, amount, token);
    }

   function permitAndTransferToOther(IAllowanceTransfer.PermitSingle calldata permitSingle, bytes calldata signature, uint160 amount, address recipient) public {
       if (permitSingle.spender != address(this)) revert InvalidSpender(permitSingle.spender);
       permit2.permit(msg.sender, permitSingle, signature);
       permit2.transferFrom(msg.sender, recipient, amount, permitSingle.details.token);
   }
}
