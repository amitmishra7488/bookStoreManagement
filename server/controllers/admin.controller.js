const { sendEmail } = require("../utils/mailer");
const { generateOtp } = require("../utils/generateOtp");
const RoleChangeRequestModel = require("../models/roleChangeRequest.model");
const UserModel = require("../models/user.model");

const processRoleChangeRequest = async (req, res) => {
    try {
      // Extract action from the request body and request ID from the URL parameters
      const { action } = req.body;
      const requestedId = req.params.id;
  
      // Find the role change request by ID
      const roleChangeRequest = await RoleChangeRequestModel.findOne({requestedBy : requestedId});
      if (!roleChangeRequest) {
        return res.status(404).json({ error: 'Role change request not found' });
      }
  
      // Update the status of the role change request
      roleChangeRequest.status = action === 'approve' ? 'approved' : 'rejected';
      await roleChangeRequest.save();
  
      // If the request is approved, update the user's role in UserModel
      if (action === 'approve') {
        // Find the user by their ID
        const user = await UserModel.findById(roleChangeRequest.requestedBy);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        // Update the user's role
        user.role = roleChangeRequest.requestedRole;
        await user.save();
      }
  
      res.status(200).json({ message: 'Role change request processed successfully' });
    } catch (error) {
      console.error('Error processing role change request:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  };
  

  module.exports = {
    processRoleChangeRequest,
  }