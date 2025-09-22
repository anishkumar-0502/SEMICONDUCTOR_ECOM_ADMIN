import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import BasicInfo from "./components/BasicInfo";
import RoleInfo from "./components/RoleInfo";

function getSteps() {
  return ["1. Basic Information", "2. Role Info"];
}

function getStepContent(stepIndex, formData, setFormData, handleNext, handleBack) {
  switch (stepIndex) {
    case 0:
      return <BasicInfo formData={formData} setFormData={setFormData} onNext={handleNext} />;
    case 1:
      return <RoleInfo formData={formData} setFormData={setFormData} onBack={handleBack} />;
    default:
      return null;
  }
}

export default function NewUsers() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const [formData, setFormData] = useState({});

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <SoftBox mt={3} mb={15}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={10}>
            <SoftTypography variant="h4" fontWeight="bold" mb={1}>
              Create New User
            </SoftTypography>
            <SoftTypography variant="body2" color="text" mb={3}>
              Fill in the details below to add a new user.
            </SoftTypography>

            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Card sx={{ overflow: "visible", p: 4, mt: 3 }}>
              {getStepContent(activeStep, formData, setFormData, handleNext, handleBack)}
            </Card>
          </Grid>
        </Grid>
      </SoftBox>

      <Footer />
    </DashboardLayout>
  );
}
