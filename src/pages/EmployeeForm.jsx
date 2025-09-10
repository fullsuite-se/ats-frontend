import React, { useState } from 'react';

// Helper function to convert empty strings to null
const toNullIfEmpty = (value) => {
  return value === '' ? null : value;
};

const EmployeeForm = () => {
  // State for form data
  const [formData, setFormData] = useState({
    // User credentials
    user_id: '',
    user_email: '',
    user_password: '',
    
    // Personal information
    first_name: '',
    middle_name: '',
    last_name: '',
    extension_name: '',
    sex: '',
    gender: '',
    personal_email: '',
    contact_number: '',
    company_issued_phone_number: '',
    birthdate: '',
    nickname: '',
    blood_type: '',
    civil_status: '',
    height_cm: '',
    weight_kg: '',
    birth_place: '',
    nationality: '',
    
    // Job information
    job_title_id: '',
    department_id: '',
    division_id: '',
    upline_id: '',
    office_id: '',
    team_id: '',
    
    // Salary information
    base_pay: '',
    salary_adjustment_type_id: '',
    date_salary_created: new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    }),
    
    // Document URL
    hr201_url: '',
    
    // Employment details
    shift_template_id: '',
    date_hired: '',
    date_regularization: '',
    date_offboarding: '',
    date_separated: '',
    employment_status_id: '',
    job_level_id: '',
    employment_type_id: '',
    
    // Current address
    currentBuildingNum: '',
    currentStreet: '',
    currentBarangay: '',
    currentCity: '',
    currentPostalCode: '',
    currentProvince: '',
    currentRegion: '',
    currentCountry: '',
    currentBarangayCode: '',
    currentCityCode: '',
    currentProvinceCode: '',
    currentRegionCode: '',
    
    // Permanent address
    permanentBuildingNum: '',
    permanentStreet: '',
    permanentBarangay: '',
    permanentCity: '',
    permanentPostalCode: '',
    permanentProvince: '',
    permanentRegion: '',
    permanentCountry: '',
    permanentBarangayCode: '',
    permanentCityCode: '',
    permanentProvinceCode: '',
    permanentRegionCode: '',
    
    // Government IDs
    government_ids: [],
    
    // Emergency contacts
    emergency_contacts: [],
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean the data
    const cleanData = { ...formData };
    
    // Build payload matching backend structure
    const payload = {
      user_id: toNullIfEmpty(cleanData.user_id),
      user_email: toNullIfEmpty(cleanData.user_email),
      user_password: toNullIfEmpty(cleanData.user_password),

      first_name: toNullIfEmpty(cleanData.first_name),
      middle_name: toNullIfEmpty(cleanData.middle_name),
      last_name: toNullIfEmpty(cleanData.last_name),
      extension_name: toNullIfEmpty(cleanData.extension_name),
      sex: toNullIfEmpty(cleanData.sex),
      gender: toNullIfEmpty(cleanData.gender),
      personal_email: toNullIfEmpty(cleanData.personal_email),
      contact_number: toNullIfEmpty(cleanData.contact_number),
      company_issued_phone_number: toNullIfEmpty(cleanData.company_issued_phone_number),
      birthdate: toNullIfEmpty(cleanData.birthdate),
      nickname: toNullIfEmpty(cleanData.nickname),
      blood_type: toNullIfEmpty(cleanData.blood_type),
      civil_status: toNullIfEmpty(cleanData.civil_status),
      height_cm: toNullIfEmpty(cleanData.height_cm),
      weight_kg: toNullIfEmpty(cleanData.weight_kg),
      birth_place: toNullIfEmpty(cleanData.birth_place),
      nationality: toNullIfEmpty(cleanData.nationality),

      job_title_id: toNullIfEmpty(cleanData.job_title_id),
      department_id: toNullIfEmpty(cleanData.department_id),
      division_id: toNullIfEmpty(cleanData.division_id),
      upline_id: toNullIfEmpty(cleanData.upline_id),
      office_id: toNullIfEmpty(cleanData.office_id),
      team_id: toNullIfEmpty(cleanData.team_id),

      base_pay: toNullIfEmpty(cleanData.base_pay),
      salary_adjustment_type_id: toNullIfEmpty(cleanData.salary_adjustment_type_id),
      date_salary_created: cleanData.date_salary_created,

      hr201_url: toNullIfEmpty(cleanData.hr201_url),

      shift_template_id: toNullIfEmpty(cleanData.shift_template_id),
      date_hired: toNullIfEmpty(cleanData.date_hired),
      date_regularization: toNullIfEmpty(cleanData.date_regularization),
      date_offboarding: toNullIfEmpty(cleanData.date_offboarding),
      date_separated: toNullIfEmpty(cleanData.date_separated),
      employment_status_id: toNullIfEmpty(cleanData.employment_status_id),
      job_level_id: toNullIfEmpty(cleanData.job_level_id),
      employment_type_id: toNullIfEmpty(cleanData.employment_type_id),

      // Current address
      currentBuildingNum: toNullIfEmpty(cleanData.currentBuildingNum),
      currentStreet: toNullIfEmpty(cleanData.currentStreet),
      currentBarangay: toNullIfEmpty(cleanData.currentBarangay),
      currentCity: toNullIfEmpty(cleanData.currentCity),
      currentPostalCode: toNullIfEmpty(cleanData.currentPostalCode),
      currentProvince: toNullIfEmpty(cleanData.currentProvince),
      currentRegion: toNullIfEmpty(cleanData.currentRegion),
      currentCountry: toNullIfEmpty(cleanData.currentCountry),
      currentBarangayCode: toNullIfEmpty(cleanData.currentBarangayCode),
      currentCityCode: toNullIfEmpty(cleanData.currentCityCode),
      currentProvinceCode: toNullIfEmpty(cleanData.currentProvinceCode),
      currentRegionCode: toNullIfEmpty(cleanData.currentRegionCode),

      // Permanent address
      permanentBuildingNum: toNullIfEmpty(cleanData.permanentBuildingNum),
      permanentStreet: toNullIfEmpty(cleanData.permanentStreet),
      permanentBarangay: toNullIfEmpty(cleanData.permanentBarangay),
      permanentCity: toNullIfEmpty(cleanData.permanentCity),
      permanentPostalCode: toNullIfEmpty(cleanData.permanentPostalCode),
      permanentProvince: toNullIfEmpty(cleanData.permanentProvince),
      permanentRegion: toNullIfEmpty(cleanData.permanentRegion),
      permanentCountry: toNullIfEmpty(cleanData.permanentCountry),
      permanentBarangayCode: toNullIfEmpty(cleanData.permanentBarangayCode),
      permanentCityCode: toNullIfEmpty(cleanData.permanentCityCode),
      permanentProvinceCode: toNullIfEmpty(cleanData.permanentProvinceCode),
      permanentRegionCode: toNullIfEmpty(cleanData.permanentRegionCode),

      government_ids: cleanData.government_ids,
      emergency_contacts: cleanData.emergency_contacts,
    };

    console.log('Payload:', payload);
    // Here you would typically send the payload to your backend API
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-indigo-600">
            <h3 className="text-lg font-medium text-white">Employee Registration</h3>
            <p className="mt-1 max-w-2xl text-sm text-indigo-200">
              Please fill out all the required information.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {/* User Credentials Section */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">User Credentials</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="user_id"
                    id="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="user_email" className="block text-sm font-medium text-gray-700">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    name="user_email"
                    id="user_email"
                    value={formData.user_email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="user_password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="user_password"
                    id="user_password"
                    value={formData.user_password}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Personal Information Section */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    id="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="extension_name" className="block text-sm font-medium text-gray-700">
                    Extension Name
                  </label>
                  <input
                    type="text"
                    name="extension_name"
                    id="extension_name"
                    value={formData.extension_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="personal_email" className="block text-sm font-medium text-gray-700">
                    Personal Email *
                  </label>
                  <input
                    type="email"
                    name="personal_email"
                    id="personal_email"
                    value={formData.personal_email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    id="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                    Sex
                  </label>
                  <select
                    name="sex"
                    id="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                    Birthdate
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    id="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="birth_place" className="block text-sm font-medium text-gray-700">
                    Birth Place
                  </label>
                  <input
                    type="text"
                    name="birth_place"
                    id="birth_place"
                    value={formData.birth_place}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="civil_status" className="block text-sm font-medium text-gray-700">
                    Civil Status
                  </label>
                  <select
                    name="civil_status"
                    id="civil_status"
                    value={formData.civil_status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Civil Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Job Information Section */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Job Information</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="job_title_id" className="block text-sm font-medium text-gray-700">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="job_title_id"
                    id="job_title_id"
                    value={formData.job_title_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="employment_status_id" className="block text-sm font-medium text-gray-700">
                    Employment Status *
                  </label>
                  <select
                    name="employment_status_id"
                    id="employment_status_id"
                    value={formData.employment_status_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Employment Status</option>
                    <option value="regular">Regular</option>
                    <option value="probationary">Probationary</option>
                    <option value="contractual">Contractual</option>
                    <option value="project-based">Project-based</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="employment_type_id" className="block text-sm font-medium text-gray-700">
                    Employment Type *
                  </label>
                  <select
                    name="employment_type_id"
                    id="employment_type_id"
                    value={formData.employment_type_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Employment Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="job_level_id" className="block text-sm font-medium text-gray-700">
                    Job Level *
                  </label>
                  <select
                    name="job_level_id"
                    id="job_level_id"
                    value={formData.job_level_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Job Level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department_id"
                    id="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="division_id" className="block text-sm font-medium text-gray-700">
                    Division
                  </label>
                  <input
                    type="text"
                    name="division_id"
                    id="division_id"
                    value={formData.division_id}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="date_hired" className="block text-sm font-medium text-gray-700">
                    Date Hired *
                  </label>
                  <input
                    type="date"
                    name="date_hired"
                    id="date_hired"
                    value={formData.date_hired}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="shift_template_id" className="block text-sm font-medium text-gray-700">
                    Shift Template *
                  </label>
                  <select
                    name="shift_template_id"
                    id="shift_template_id"
                    value={formData.shift_template_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Shift</option>
                    <option value="morning">Morning Shift</option>
                    <option value="afternoon">Afternoon Shift</option>
                    <option value="night">Night Shift</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Address Information Section */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
              
              <div className="mb-6">
                <h5 className="text-md font-medium text-gray-700 mb-3">Current Address *</h5>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="currentBarangay" className="block text-sm font-medium text-gray-700">
                      Barangay *
                    </label>
                    <input
                      type="text"
                      name="currentBarangay"
                      id="currentBarangay"
                      value={formData.currentBarangay}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentBarangayCode" className="block text-sm font-medium text-gray-700">
                      Barangay Code *
                    </label>
                    <input
                      type="text"
                      name="currentBarangayCode"
                      id="currentBarangayCode"
                      value={formData.currentBarangayCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      name="currentCity"
                      id="currentCity"
                      value={formData.currentCity}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentCityCode" className="block text-sm font-medium text-gray-700">
                      City Code *
                    </label>
                    <input
                      type="text"
                      name="currentCityCode"
                      id="currentCityCode"
                      value={formData.currentCityCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentProvince" className="block text-sm font-medium text-gray-700">
                      Province *
                    </label>
                    <input
                      type="text"
                      name="currentProvince"
                      id="currentProvince"
                      value={formData.currentProvince}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentProvinceCode" className="block text-sm font-medium text-gray-700">
                      Province Code *
                    </label>
                    <input
                      type="text"
                      name="currentProvinceCode"
                      id="currentProvinceCode"
                      value={formData.currentProvinceCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentRegion" className="block text-sm font-medium text-gray-700">
                      Region *
                    </label>
                    <input
                      type="text"
                      name="currentRegion"
                      id="currentRegion"
                      value={formData.currentRegion}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentRegionCode" className="block text-sm font-medium text-gray-700">
                      Region Code *
                    </label>
                    <input
                      type="text"
                      name="currentRegionCode"
                      id="currentRegionCode"
                      value={formData.currentRegionCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentCountry" className="block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="currentCountry"
                      id="currentCountry"
                      value={formData.currentCountry}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentPostalCode" className="block text-sm font-medium text-gray-700">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="currentPostalCode"
                      id="currentPostalCode"
                      value={formData.currentPostalCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentBuildingNum" className="block text-sm font-medium text-gray-700">
                      Building Number
                    </label>
                    <input
                      type="text"
                      name="currentBuildingNum"
                      id="currentBuildingNum"
                      value={formData.currentBuildingNum}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentStreet" className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      name="currentStreet"
                      id="currentStreet"
                      value={formData.currentStreet}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-3">Permanent Address *</h5>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="permanentBarangay" className="block text-sm font-medium text-gray-700">
                      Barangay *
                    </label>
                    <input
                      type="text"
                      name="permanentBarangay"
                      id="permanentBarangay"
                      value={formData.permanentBarangay}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentBarangayCode" className="block text-sm font-medium text-gray-700">
                      Barangay Code *
                    </label>
                    <input
                      type="text"
                      name="permanentBarangayCode"
                      id="permanentBarangayCode"
                      value={formData.permanentBarangayCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentCity" className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      name="permanentCity"
                      id="permanentCity"
                      value={formData.permanentCity}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentCityCode" className="block text-sm font-medium text-gray-700">
                      City Code *
                    </label>
                    <input
                      type="text"
                      name="permanentCityCode"
                      id="permanentCityCode"
                      value={formData.permanentCityCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentProvince" className="block text-sm font-medium text-gray-700">
                      Province *
                    </label>
                    <input
                      type="text"
                      name="permanentProvince"
                      id="permanentProvince"
                      value={formData.permanentProvince}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentProvinceCode" className="block text-sm font-medium text-gray-700">
                      Province Code *
                    </label>
                    <input
                      type="text"
                      name="permanentProvinceCode"
                      id="permanentProvinceCode"
                      value={formData.permanentProvinceCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentRegion" className="block text-sm font-medium text-gray-700">
                      Region *
                    </label>
                    <input
                      type="text"
                      name="permanentRegion"
                      id="permanentRegion"
                      value={formData.permanentRegion}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentRegionCode" className="block text-sm font-medium text-gray-700">
                      Region Code *
                    </label>
                    <input
                      type="text"
                      name="permanentRegionCode"
                      id="permanentRegionCode"
                      value={formData.permanentRegionCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentCountry" className="block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="permanentCountry"
                      id="permanentCountry"
                      value={formData.permanentCountry}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentPostalCode" className="block text-sm font-medium text-gray-700">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="permanentPostalCode"
                      id="permanentPostalCode"
                      value={formData.permanentPostalCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentBuildingNum" className="block text-sm font-medium text-gray-700">
                      Building Number
                    </label>
                    <input
                      type="text"
                      name="permanentBuildingNum"
                      id="permanentBuildingNum"
                      value={formData.permanentBuildingNum}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="permanentStreet" className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      name="permanentStreet"
                      id="permanentStreet"
                      value={formData.permanentStreet}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;