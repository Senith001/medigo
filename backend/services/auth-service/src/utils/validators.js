export const validatePatientRegistration = (data) => {
  const errors = {};

  // 1. Full Name: English letters only, exactly one space, max 20 chars
  if (!data.fullName) {
    errors.fullName = "Full name is required";
  } else if (data.fullName.length > 20) {
    errors.fullName = "Full name cannot exceed 20 characters";
  } else if (!/^[A-Za-z]+ [A-Za-z]+$/.test(data.fullName)) {
    errors.fullName = "Full name must contain only English letters and exactly one space separating two names";
  }

  // 2. Email: Valid format
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  // 3. Phone: 07XXXXXXXX format
  if (!data.phone) {
    errors.phone = "Phone number is required";
  } else if (!/^07\d{8}$/.test(data.phone)) {
    errors.phone = "Phone number must be in 07XXXXXXXX format";
  }

  // 4. Password: >8 chars (min 9), 1 uppercase, 1 lowercase, 1 number, 1 special char
  if (!data.password) {
    errors.password = "Password is required";
  } else if (!validatePassword(data.password)) {
    errors.password = "Password must be more than 8 characters and contain at least one uppercase, one lowercase, one number, and one special character";
  }

  // 5. Gender: Validate against expected frontend checkbox values
  if (data.gender && !['male', 'female', 'other'].includes(data.gender.toLowerCase())) {
    errors.gender = "Invalid gender selection";
  }

  // 6. Date of Birth: Must be a valid date
  if (data.dateOfBirth && isNaN(Date.parse(data.dateOfBirth))) {
    errors.dateOfBirth = "Invalid Date of Birth format";
  }

  // 7. Blood Group: Ensure it's not empty if provided
  if (data.bloodGroup && data.bloodGroup.trim() === "") {
    errors.bloodGroup = "Blood group cannot be empty";
  }

  // 8. Address: Ensure it's not empty if provided
  if (data.address && data.address.trim() === "") {
    errors.address = "Address cannot be empty";
  }

  // 9. Emergency Contact Name: Ensure it's not empty if provided
  if (data.emergencyContactName && data.emergencyContactName.trim() === "") {
    errors.emergencyContactName = "Emergency contact name cannot be empty";
  }

  // 10. Emergency Contact Phone: 07XXXXXXXX format
  if (data.emergencyContactPhone && !/^07\d{8}$/.test(data.emergencyContactPhone)) {
    errors.emergencyContactPhone = "Emergency contact phone must be in 07XXXXXXXX format";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Extracted password validator so it can be reused for reset/change password
export const validatePassword = (password) => {
  // Regex explanation:
  // (?=.*[a-z]) : At least one lowercase
  // (?=.*[A-Z]) : At least one uppercase
  // (?=.*\d)    : At least one number
  // (?=.*[^A-Za-z0-9]) : At least one special character (anything not a letter/number)
  // .{9,}       : Minimum 9 characters (more than 8)
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
};