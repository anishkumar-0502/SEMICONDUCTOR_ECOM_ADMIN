import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import axiosInstance from "utils/axiosInstance";
import StatusCell from "./components/StatusCell";
import { usePermissions } from "hooks/usePermission";
import axios from "axios";

const statusFlow = ["confirmed","placed", "shipped", "out-for-delivery", "delivered"];

// ✅ ActionCell component
function ActionCell({ order, onView, onEdit, onPackageReceived, canView, canUpdate, canReceive }) {
  return (
    <SoftBox display="flex" alignItems="center">
      {/* View Order */}
      <SoftTypography variant="body1" color="secondary" sx={{ lineHeight: 0 }}>
        <Tooltip title={canView ? "View Order" : "No permission"} placement="top">
          <span>
            <Icon
              onClick={() => canView && onView(order)}
              sx={{
                cursor: canView ? "pointer" : "not-allowed",
                opacity: canView ? 1 : 0.5,
              }}
            >
              visibility
            </Icon>
          </span>
        </Tooltip>
      </SoftTypography>

      {/* Update Status */}
      <SoftBox mx={2}>
        <SoftTypography variant="body1" color="secondary" sx={{ lineHeight: 0 }}>
          <Tooltip title={canUpdate ? "Update Status" : "No permission"} placement="top">
            <span>
              <Icon
                onClick={() => canUpdate && onEdit(order)}
                sx={{
                  opacity: !order.nextStatus || !canUpdate ? 0.5 : 1,
                  pointerEvents: !order.nextStatus || !canUpdate ? "none" : "auto",
                  cursor: canUpdate ? "pointer" : "not-allowed",
                }}
              >
                edit
              </Icon>
            </span>
          </Tooltip>
        </SoftTypography>
      </SoftBox>

      {/* Package Received */}
      <SoftBox mx={2}>
        <SoftTypography variant="body1" color="secondary" sx={{ lineHeight: 0 }}>
          {(() => {
            const status = (order.status || "").toLowerCase();
            const allowedStatuses = new Set(["placed", "shipped", "out-for-delivery", "delivered"]);
            const isStatusAllowed = allowedStatuses.has(status);
            const enabled = canReceive && isStatusAllowed;
            const tooltipText = !canReceive
              ? "No permission"
              : isStatusAllowed
              ? "Mark Package Received"
              : "Enabled after status becomes 'placed'";
            return (
              <Tooltip title={tooltipText} placement="top">
                <span>
                  <Icon
                    onClick={() => enabled && onPackageReceived(order)}
                    sx={{
                      cursor: enabled ? "pointer" : "not-allowed",
                      opacity: enabled ? 1 : 0.5,
                      color: enabled ? "#22c55e" : "#9ca3af",
                    }}
                  >
                    inventory_2
                  </Icon>
                </span>
              </Tooltip>
            );
          })()}
        </SoftTypography>
      </SoftBox>
    </SoftBox>
  );
}

ActionCell.propTypes = {
  order: PropTypes.shape({
    status: PropTypes.string,     // added for ESLint validation
    nextStatus: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onPackageReceived: PropTypes.func.isRequired,
  canView: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  canReceive: PropTypes.bool.isRequired,
};

// ✅ Shipway Popup Modal Steps Component
function ShipwayStepsModal({ open, onClose, order, onOpenShipmentDetails }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [awbResponse, setAwbResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shipmentAction, setShipmentAction] = useState("");
  // New UI state for pickup and package details
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [officeCloseTime, setOfficeCloseTime] = useState("");
  const [packageCount, setPackageCount] = useState("1");
  const [carrierId, setCarrierId] = useState("");
  const [orderWeight, setOrderWeight] = useState("");
  const [boxLength, setBoxLength] = useState("");
  const [boxBreadth, setBoxBreadth] = useState("");
  const [boxHeight, setBoxHeight] = useState("");

  const steps = [
    "Push Order to Shipway",
    "Generate Shipping Label",
    "Create Manifest",
    "Create Pickup",
    "Insert Order",
  ];

  // Load warehouses when modal opens (robust to null/array/object)
  useEffect(() => {
  if (!open) return;

  axiosInstance
    .get(`/shipway/getwarehouses`)
    .then((res) => {
      const success = res?.data?.success;
      const message = res?.data?.data?.message; // <-- note the nested path
      if (success && message && typeof message === "object") {
        // Convert object of warehouses to array
        const warehousesArray = Object.values(message);
        setWarehouses(warehousesArray);
      } else {
        setWarehouses([]);
      }
    })
    .catch(() => setWarehouses([]));
}, [open]);


  // Reset/restore state when switching to a different order
  useEffect(() => {
    if (!order?.orderId) return;

    // base resets
    setSelectedWarehouse(null);
    setIsProcessing(false);
    setPickupDate("");
    setPickupTime("");
    setOfficeCloseTime("");
    setPackageCount("1");
    setOrderWeight("");
    setBoxLength("");
    setBoxBreadth("");
    setBoxHeight("");
    setCarrierId(order.carrierId || "");

    // resume progress if exists
    const progress = loadProgress(order.orderId) || {};
    const stepToResume = Number.isInteger(progress.currentStep) ? progress.currentStep : 0;
    setCurrentStep(stepToResume);

    if (progress.awbResponse) setAwbResponse(progress.awbResponse);
    if (progress.selectedWarehouse) setSelectedWarehouse(progress.selectedWarehouse);
    if (progress.form) {
      const f = progress.form;
      if (f.pickupDate) setPickupDate(f.pickupDate);
      if (f.pickupTime) setPickupTime(f.pickupTime);
      if (f.officeCloseTime) setOfficeCloseTime(f.officeCloseTime);
      if (f.packageCount) setPackageCount(f.packageCount);
      if (f.orderWeight) setOrderWeight(f.orderWeight);
      if (f.boxLength) setBoxLength(f.boxLength);
      if (f.boxBreadth) setBoxBreadth(f.boxBreadth);
      if (f.boxHeight) setBoxHeight(f.boxHeight);
      if (f.carrierId) setCarrierId(f.carrierId);
    }
  }, [order?.orderId]);

  // Persist/resume progress per order in localStorage
  const getProgressKey = (id) => `shipwayProgress:${id}`;
  const loadProgress = (id) => {
    try {
      return JSON.parse(localStorage.getItem(getProgressKey(id)) || "{}");
    } catch (e) {
      return {};
    }
  };
  const saveProgress = (id, data) => {
    try {
      const prev = loadProgress(id);
      localStorage.setItem(getProgressKey(id), JSON.stringify({ ...prev, ...data }));
    } catch (e) {}
  };
  const clearProgress = (id) => {
    try { localStorage.removeItem(getProgressKey(id)); } catch (e) {}
  };

  // Helper function to remove empty/null/undefined values from payload
  const filterEmptyValues = (obj) => {
    const filtered = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      // Include the field if it has a meaningful value
      // Allow 0, false, and other falsy values except null, undefined, and empty string
      if (value !== null && value !== undefined && value !== "") {
        // For arrays (like products), filter each item as well
        if (Array.isArray(value)) {
          const filteredArray = value.map(item => 
            typeof item === 'object' && item !== null ? filterEmptyValues(item) : item
          ).filter(item => item !== null && item !== undefined && item !== "");
          
          if (filteredArray.length > 0) {
            filtered[key] = filteredArray;
          }
        } else if (typeof value === 'object' && value !== null) {
          const filteredNested = filterEmptyValues(value);
          if (Object.keys(filteredNested).length > 0) {
            filtered[key] = filteredNested;
          }
        } else {
          filtered[key] = value;
        }
      }
    });
    return filtered;
  };

  // Helper function to conditionally render field only if it has a value
  const renderField = (label, value, prefix = "", suffix = "") => {
    if (value !== null && value !== undefined && value !== "" && value !== "N/A") {
      return (
        <SoftTypography variant="caption" display="block">
          <strong>{label}:</strong> {prefix}{value}{suffix}
        </SoftTypography>
      );
    }
    return null;
  };

  // Step 1: Push Order to Shipway payload
  const buildPushOrderPayload = (orderData) => {
    const { items, billingDetails } = orderData;

    const products = (items || []).map((item) => {
      const productData = {
        product: item.name,
        price: String(((item.totalPrice ?? 0) )),
        product_code: item.productId,
        product_quantity: String(item.qty ?? 1),
        discount: item.discount ? String(item.discount) : undefined,
        tax_rate: item.taxRate ? String(item.taxRate) : undefined,
        tax_title: item.taxTitle || "IGST",
      };
      return filterEmptyValues(productData);
    });

    const payload = {
      order_id: orderData.orderId,
      ewaybill: orderData.ewaybill,
      products,
      discount: orderData.discount ? String(orderData.discount) : undefined,
      shipping: orderData.shippingCharge ? String(orderData.shippingCharge) : undefined,
      order_total: orderData.total ? String(orderData.total) : undefined,
      gift_card_amt: orderData.giftCardAmount ? String(orderData.giftCardAmount) : undefined,
      taxes: orderData.gstAmount ? String(orderData.gstAmount) : undefined,
      payment_type: orderData.paymentType || "P",
      email: billingDetails?.email,
      billing_address: billingDetails?.address,
      billing_address2: billingDetails?.address2,
      billing_city: billingDetails?.city,
      billing_state: billingDetails?.state,
      billing_country: billingDetails?.country,
      billing_firstname: billingDetails?.first_name,
      billing_lastname: billingDetails?.last_name,
      billing_phone: billingDetails?.phone,
      billing_zipcode: billingDetails?.pin,
      billing_latitude: orderData.billing_latitude,
      billing_longitude: orderData.billing_longitude,
      shipping_address: billingDetails?.address,
      shipping_address2: billingDetails?.address2,
      shipping_city: billingDetails?.city,
      shipping_state: billingDetails?.state,
      shipping_country: billingDetails?.country || "India",
      shipping_firstname: billingDetails?.first_name,
      shipping_lastname: billingDetails?.last_name,
      shipping_phone: billingDetails?.phone,
      shipping_zipcode: billingDetails?.pin,
      shipping_latitude: orderData.shipping_latitude,
      shipping_longitude: orderData.shipping_longitude,
      order_weight: orderWeight,
      box_length: boxLength,
      box_breadth: boxBreadth,
      box_height: boxHeight,
      order_date : orderData.createdAt
  ? new Date(orderData.createdAt)
      .toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })
      .replace(",", "")
  : new Date()
      .toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })
      .replace(",", "")

    };

    return filterEmptyValues(payload);
  };

  // Step 2: Label Generation payload
  const buildLabelGenerationPayload = (orderData) => {
    const { items, billingDetails } = orderData;

    const products = (items || []).map((item) => {
      const productData = {
        product: item.name,
        price: String(((item.totalPrice ?? 0) / (item.qty ?? 1)).toFixed(2)),
        product_code: item.productId,
        product_quantity: String(item.qty ?? 1),
        discount: item.discount ? String(item.discount) : undefined,
        tax_rate: item.taxRate ? String(item.taxRate) : undefined,
        tax_title: item.taxTitle || "IGST",
      };
      return filterEmptyValues(productData);
    });

    const payload = {
      order_id: orderData.orderId,
      carrier_id: orderData.carrierId ? Number(orderData.carrierId) : (carrierId ? Number(carrierId) : undefined),
      warehouse_id: selectedWarehouse?.warehouse_id,
      return_warehouse_id: selectedWarehouse?.warehouse_id,
      ewaybill: orderData.ewaybill,
      products,
      discount: orderData.discount ? String(orderData.discount) : undefined,
      shipping: orderData.shippingCharge ? String(orderData.shippingCharge) : undefined,
      order_total: orderData.total ? String(orderData.total) : undefined,
      gift_card_amt: orderData.giftCardAmount ? String(orderData.giftCardAmount) : undefined,
      taxes: orderData.gstAmount ? String(orderData.gstAmount) : undefined,
      payment_type: orderData.paymentType || "P",
      email: billingDetails?.email,
      billing_address: billingDetails?.address,
      billing_address2: billingDetails?.address2,
      billing_city: billingDetails?.city,
      billing_state: billingDetails?.state,
      billing_country: billingDetails?.country || "India",
      billing_firstname: billingDetails?.first_name,
      billing_lastname: billingDetails?.last_name,
      billing_phone: billingDetails?.phone,
      billing_zipcode: billingDetails?.pin,
      billing_latitude: orderData.billing_latitude,
      billing_longitude: orderData.billing_longitude,
      shipping_address: billingDetails?.address,
      shipping_address2: billingDetails?.address2,
      shipping_city: billingDetails?.city,
      shipping_state: billingDetails?.state,
      shipping_country: billingDetails?.country || "India",
      shipping_firstname: billingDetails?.first_name,
      shipping_lastname: billingDetails?.last_name,
      shipping_phone: billingDetails?.phone,
      shipping_zipcode: billingDetails?.pin,
      shipping_latitude: orderData.shipping_latitude,
      shipping_longitude: orderData.shipping_longitude,
      order_weight: orderWeight ? String(orderWeight) : undefined,
      box_length: boxLength ? String(boxLength) : undefined,
      box_breadth: boxBreadth ? String(boxBreadth) : undefined,
      box_height: boxHeight ? String(boxHeight) : undefined,
      order_date: orderData.createdAt
        ? new Date(orderData.createdAt).toISOString().slice(0, 19).replace("T", " ")
        : new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    return filterEmptyValues(payload);
  };

  // Step 3: Create Manifest payload
  const buildManifestPayload = (orderData) => {
    const payload = {
      order_ids: orderData.orderId ? [orderData.orderId] : undefined,
    };
    return filterEmptyValues(payload);
  };

  // Step 4: Create Pickup payload
  const buildPickupPayload = (orderData) => {
    const payload = {
      pickup_date: pickupDate || new Date().toISOString().slice(0, 10),
      pickup_time: pickupTime ,
      office_close_time: officeCloseTime,
      package_count: packageCount ,
      carrier_id: orderData.carrierId ? String(orderData.carrierId) : (carrierId ? String(carrierId) : undefined),
      warehouse_id: selectedWarehouse?.warehouse_id,
      return_warehouse_id: selectedWarehouse?.warehouse_id,
      payment_type: "P",
      order_ids: orderData.orderId ? [orderData.orderId] : undefined,
    };
    return filterEmptyValues(payload);
  };

  // Step 5: Insert Order payload
  const buildInsertOrderPayload = (orderData) => {
    const { items, billingDetails } = orderData;

    const products = (items || []).map((item) => {
      const productData = {
        product: item.name,
        price: String(((item.totalPrice ?? 0) / (item.qty ?? 1)).toFixed(2)),
        product_code: item.productId,
        product_quantity: String(item.qty ?? 1),
        discount: item.discount ? String(item.discount) : undefined,
        tax_rate: item.taxRate ? String(item.taxRate) : undefined,
        tax_title: item.taxTitle || "IGST",
      };
      return filterEmptyValues(productData);
    });

    const payload = {
      order_id: orderData.orderId,
      order_tracking_number: awbResponse?.AWB,
      shipment_status_update: null,
      shipment_status: orderData.shipment_status,
      und_reason: orderData.und_reason,
      carrier_id: orderData.carrierId ? Number(orderData.carrierId) : (carrierId ? Number(carrierId) : undefined),
      warehouse_id: selectedWarehouse?.warehouse_id,
      return_warehouse_id: selectedWarehouse?.warehouse_id,
      products,
      discount: orderData.discount ? String(orderData.discount) : undefined,
      shipping: orderData.shippingCharge ? String(orderData.shippingCharge) : undefined,
      order_total: orderData.total ? String(orderData.total) : undefined,
      gift_card_amt: orderData.giftCardAmount ? String(orderData.giftCardAmount) : undefined,
      taxes: orderData.gstAmount ? String(orderData.gstAmount) : undefined,
      payment_type: orderData.paymentType || "P",
      email: billingDetails?.email,
      billing_address: billingDetails?.address,
      billing_address2: billingDetails?.address2,
      billing_city: billingDetails?.city,
      billing_state: billingDetails?.state,
      billing_country: billingDetails?.country,
      billing_firstname: billingDetails?.first_name,
      billing_lastname: billingDetails?.last_name,
      billing_phone: billingDetails?.phone,
      billing_zipcode: billingDetails?.pin,
      billing_latitude: orderData.billing_latitude,
      billing_longitude: orderData.billing_longitude,
      shipping_address: billingDetails?.address,
      shipping_address2: billingDetails?.address2,
      shipping_city: billingDetails?.city,
      shipping_state: billingDetails?.state,
      shipping_country: billingDetails?.country || "India",
      shipping_firstname: billingDetails?.first_name,
      shipping_lastname: billingDetails?.last_name,
      shipping_phone: billingDetails?.phone,
      shipping_zipcode: billingDetails?.pin,
      shipping_latitude: orderData.shipping_latitude,
      shipping_longitude: orderData.shipping_longitude,
      order_weight: orderWeight ? String(orderWeight) : undefined,
      box_length: boxLength ? String(boxLength) : undefined,
      box_breadth: boxBreadth ? String(boxBreadth) : undefined,
      box_height: boxHeight ? String(boxHeight) : undefined,
      order_date: orderData.createdAt
        ? new Date(orderData.createdAt).toISOString().slice(0, 19).replace("T", " ")
        : new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    return filterEmptyValues(payload);
  };

  const handleNextStep = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
      if (currentStep === 0) {
        const payload = buildPushOrderPayload(order);
        const res = await axiosInstance.post(`/shipway/pushOrders`, payload);
        if (res.data.success) {
          Swal.fire("Success", "Order pushed to Shipway", "success");
          const next = 1;
          setCurrentStep(next);
          saveProgress(order.orderId, { currentStep: next });
        } else {
          Swal.fire("Error", res.data.message || "Failed to push order", "error");
        }
      } else if (currentStep === 1) {
        const payload = buildLabelGenerationPayload(order);
        const res = await axiosInstance.post(`/shipway/labelGeneration`, payload);
        if (res.data.success) {
          setAwbResponse(res.data.awb_response);
          saveProgress(order.orderId, { awbResponse: res.data.awb_response });
          if (res.data.awb_response?.AWB) {
            Swal.fire("Label Generated", `AWB: ${res.data.awb_response.AWB}`, "success");
          } else {
            Swal.fire("Warning", res.data.awb_response?.error?.join(", ") || "Label generation completed with warnings", "warning");
          }
          const next = 2;
          setCurrentStep(next);
          saveProgress(order.orderId, { currentStep: next });
        } else {
          Swal.fire("Error", res.data.message || "Failed to generate label", "error");
        }
      } else if (currentStep === 2) {
        const payload = buildManifestPayload(order);
        const res = await axiosInstance.post(`/shipway/CreateOrderManifest`, payload);
        if (res.data.success) {
          Swal.fire("Manifest Created", res.data.message || "Manifest created successfully", "success");
          const next = 3;
          setCurrentStep(next);
          saveProgress(order.orderId, { currentStep: next });
        } else {
          Swal.fire("Error", res.data.message || "Failed to create manifest", "error");
        }
      } else if (currentStep === 3) {
        const payload = buildPickupPayload(order);
        const res = await axiosInstance.post(`/shipway/createPickup`, payload);
        if (res.data.success) {
          Swal.fire("Pickup Created", "Pickup request created successfully", "success");
          const next = 4;
          setCurrentStep(next);
          saveProgress(order.orderId, { currentStep: next });
        } else {
          Swal.fire("Error", res.data.message || "Failed to create pickup", "error");
        }
      } else if (currentStep === 4) {
        const payload = buildInsertOrderPayload(order);
        const res = await axiosInstance.post(`/shipway/InsertOrder`, payload);
        if (res.data) {
          Swal.fire("Order Inserted", "Order inserted successfully", "success");
          const next = 5;
          setCurrentStep(next);
          saveProgress(order.orderId, { currentStep: next });
        } else {
          Swal.fire("Error", "Failed to insert order", "error");
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelShipment = async () => {
    try {
      if (currentStep < 5) {
        Swal.fire("Not allowed", "Complete all steps before performing shipment actions.", "info");
        return;
      }
      const awb = awbResponse?.AWB;
      if (!awb) {
        Swal.fire("No AWB", "AWB number not available yet.", "info");
        return;
      }

      const confirm = await Swal.fire({
        title: "Cancel Shipment?",
        text: `This will cancel AWB ${awb}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel",
      });
      if (!confirm.isConfirmed) return;

      const res = await axiosInstance.post(`/shipway/CancelShipment/`, {
        awb_number: [awb],
      });

      const entry = res?.data?.data?.[0];
      if (res?.data?.success && entry && entry.success) {
        Swal.fire("Canceled", `Shipment for AWB ${awb} canceled.`, "success");
      } else {
        const msg = entry?.message || res?.data?.message || "Cancel request failed";
        Swal.fire("Failed", msg, "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Cancel request error", "error");
    }
  };

  const handleOnHold = async () => {
    try {
      if (currentStep < 5) {
        Swal.fire("Not allowed", "Complete all steps before performing shipment actions.", "info");
        return;
      }
      const orderId = order?.orderId;
      if (!orderId) return;

      const confirm = await Swal.fire({
        title: "Put On Hold?",
        text: `This will mark order ${orderId} as On Hold (Shipway).`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, hold",
      });
      if (!confirm.isConfirmed) return;

      const res = await axiosInstance.post(`/shipway/OnholdOrders`, {
        order_ids: [orderId],
      });

      const entry = res?.data?.data?.[0];
      if (res?.data?.success && entry) {
        const msg = entry?.status_message || entry?.onhold_response?.message || "On-hold request processed";
        const ok = entry?.onhold_response?.success;
        Swal.fire(ok ? "On Hold" : "Info", msg, ok ? "success" : "info");
      } else {
        Swal.fire("Failed", res?.data?.message || "On-hold request failed", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "On-hold request error", "error");
    }
  };

const handleWarehouseSelect = (warehouseId) => {
  const selected = warehouses.find((w) => w.warehouse_id === warehouseId);
  setSelectedWarehouse(selected || null);
};
  // Persist form fields and selections while user fills in
  useEffect(() => {
    if (!order?.orderId) return;
    saveProgress(order.orderId, {
      selectedWarehouse,
      awbResponse,
      form: {
        pickupDate,
        pickupTime,
        officeCloseTime,
        packageCount,
        orderWeight,
        boxLength,
        boxBreadth,
        boxHeight,
        carrierId,
      },
    });
  }, [order?.orderId, selectedWarehouse, awbResponse, pickupDate, pickupTime, officeCloseTime, packageCount, orderWeight, boxLength, boxBreadth, boxHeight, carrierId]);

  // Custom Stepper Component
  const CustomStepper = () => (
    <SoftBox display="flex" alignItems="center" justifyContent="center" mb={3}>
      {steps.map((step, index) => (
        <SoftBox key={index} display="flex" alignItems="center">
          {/* Step Circle */}
          <SoftBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="40px"
            height="40px"
            borderRadius="50%"
            sx={{
              backgroundColor: index <= currentStep ? "#22c55e" : "#e5e7eb",
              color: index <= currentStep ? "#fff" : "#6b7280",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {index + 1}
          </SoftBox>
          
          {/* Step Label */}
          <SoftBox ml={1} mr={2}>
            <SoftTypography
              variant="caption"
              fontWeight={index === currentStep ? "bold" : "regular"}
              color={index <= currentStep ? "dark" : "secondary"}
              sx={{ fontSize: "11px", maxWidth: "80px", textAlign: "center" }}
            >
              {step}
            </SoftTypography>
          </SoftBox>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <SoftBox
              width="30px"
              height="2px"
              sx={{
                backgroundColor: index < currentStep ? "#22c55e" : "#e5e7eb",
                mr: 2,
              }}
            />
          )}
        </SoftBox>
      ))}
    </SoftBox>
  );

  // Get current step payload for display
  const getCurrentStepData = () => {
    if (!order) return {};
    
    switch (currentStep) {
      case 0:
        return buildPushOrderPayload(order);
      case 1:
        return buildLabelGenerationPayload(order);
      case 2:
        return buildManifestPayload(order);
      case 3:
        return buildPickupPayload(order);
      case 4:
        return buildInsertOrderPayload(order);
      default:
        return {};
    }
  };

 const renderStepContent = () => {
  const stepData = getCurrentStepData();

  // Accordion-based, compact detail UI
  const Section = ({ title, children, defaultExpanded = true }) => (
    <Accordion defaultExpanded={defaultExpanded} disableGutters sx={{ mb: 1, boxShadow: 1, border: "1px solid #ddd", borderRadius: 1 }}>
      <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
        <SoftTypography variant="button" fontWeight="bold" sx={{ fontSize: "1rem" }}>{title}</SoftTypography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: 2 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  const InfoGrid = ({ children }) => (
    <Grid container spacing={1.5}>
      {children}
    </Grid>
  );
  InfoGrid.propTypes = {
    children: PropTypes.node
  };

  const InfoRow = ({ label, value, prefix = "", suffix = "" }) => {
    if (value === null || value === undefined || value === "" || value === "N/A") return null;
    return (
      <Grid item xs={12} sm={6}>
        <SoftTypography variant="caption" color="text" display="block">{label}</SoftTypography>
        <SoftTypography variant="button" sx={{ fontWeight: 500 }}>{prefix}{value}{suffix}</SoftTypography>
      </Grid>
    );
  };
  InfoRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    prefix: PropTypes.string,
    suffix: PropTypes.string
  };

  const ProductRow = ({ product }) => {
    const parts = [];
    if (product.product_quantity) parts.push(`Qty: ${product.product_quantity}`);
    if (product.price) parts.push(`Price: ₹${product.price}`);
    if (product.product_code) parts.push(`Code: ${product.product_code}`);
    if (product.discount && product.discount !== "0") parts.push(`Discount: ₹${product.discount}`);
    if (product.tax_rate && product.tax_rate !== "0") parts.push(`Tax: ${product.tax_rate}%`);
    if (product.tax_title) parts.push(`Tax Title: ${product.tax_title}`);

    return (
      <SoftBox py={1}>
        {product.product && (
          <SoftTypography variant="button" display="block" fontWeight="medium">
            {product.product}
          </SoftTypography>
        )}
        {parts.length > 0 && (
          <SoftTypography variant="caption" color="text">
            {parts.join(" • ")}
          </SoftTypography>
        )}
      </SoftBox>
    );
  };
  ProductRow.propTypes = {
    product: PropTypes.shape({
      product: PropTypes.string,
      product_quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      product_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      tax_rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      tax_title: PropTypes.string,
    }).isRequired
  };

  Section.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    defaultExpanded: PropTypes.bool
  };

  switch (currentStep) {
    case 0:
      return (
        <SoftBox>
          <SoftTypography variant="h6" mb={1.5} color="info" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
            Step 1: Push Order to Shipway
          </SoftTypography>

          <Section title="Order Information">
            <InfoGrid>
              <InfoRow label="Order ID" value={stepData.order_id} />
              <InfoRow label="Order Total" value={stepData.order_total} prefix="₹" />
              <InfoRow label="Payment Type" value={stepData.payment_type === 'P' ? 'Prepaid' : 'COD'} />
              <InfoRow label="Shipping" value={stepData.shipping} prefix="₹" />
              <InfoRow label="Discount" value={stepData.discount} prefix="₹" />
              <InfoRow label="Taxes" value={stepData.taxes} prefix="₹" />
              <InfoRow label="Gift Card Amount" value={stepData.gift_card_amt} prefix="₹" />
              <InfoRow label="E-way Bill" value={stepData.ewaybill} />
              <InfoRow label="Order Date" value={stepData.order_date} />
              <InfoRow label="Email" value={stepData.email} />
            </InfoGrid>
          </Section>

          <Section title="Shipping Details">
            <InfoGrid>
              <InfoRow label="Address" value={stepData.shipping_address} />
              <InfoRow label="City" value={stepData.shipping_city} />
              <InfoRow label="State" value={stepData.shipping_state} />
              <InfoRow label="Country" value={stepData.shipping_country} />
              <InfoRow label="Zipcode" value={stepData.shipping_zipcode} />
              <InfoRow label="Firstname" value={stepData.shipping_firstname} />
              <InfoRow label="Lastname" value={stepData.shipping_lastname} />
              <InfoRow label="Phone" value={stepData.shipping_phone} />
            </InfoGrid>
          </Section>

          <Section title={`Products (${stepData.products?.length || 0})`}>
            {stepData.products?.map((p, idx) => (
              <React.Fragment key={idx}>
                <ProductRow product={p} />
                {idx < stepData.products.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </Section>
        </SoftBox>
      );

    case 1:
      return (
        <SoftBox>
          <SoftTypography variant="h6" mb={1.5} color="info" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
            Step 2: Generate Shipping Label
          </SoftTypography>

          <Section title="Warehouse Selection">
            <Grid container spacing={2} mb={1}>
              <Grid item xs={12} md={6}>
                <SoftTypography variant="body2" mb={1}>Select Warehouse</SoftTypography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={selectedWarehouse?.warehouse_id || ""}
                  onChange={(e) => handleWarehouseSelect(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>
                      {w.title} - {w.address_1}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Section>

          {selectedWarehouse && (
            <Section title="Selected Warehouse">
              <InfoGrid>
                <InfoRow label="Name" value={selectedWarehouse.title} />
                <InfoRow label="Address" value={selectedWarehouse.address_1} />
                <InfoRow label="Warehouse ID" value={selectedWarehouse.warehouse_id} />
                <InfoRow label="Return Warehouse ID" value={selectedWarehouse.warehouse_id} />
              </InfoGrid>
            </Section>
          )}

          <Section title="Order Dimensions">
            <InfoGrid>
              <InfoRow label="Order Weight" value={stepData.order_weight} suffix=" kg" />
              <InfoRow label="Box Length" value={stepData.box_length} suffix=" cm" />
              <InfoRow label="Box Breadth" value={stepData.box_breadth} suffix=" cm" />
              <InfoRow label="Box Height" value={stepData.box_height} suffix=" cm" />
              <InfoRow label="Carrier ID" value={stepData.carrier_id} />
            </InfoGrid>
          </Section>
        </SoftBox>
      );

    case 2:
      return (
        <SoftBox>
          <SoftTypography variant="h6" mb={1.5} color="info" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
            Step 3: Create Manifest
          </SoftTypography>

          <Section title="Manifest Information">
            <InfoGrid>
              <InfoRow label="Order IDs" value={stepData.order_ids?.length > 0 ? `[${stepData.order_ids.join(", ")}]` : null} />
              <InfoRow label="Total Orders" value={stepData.order_ids?.length} />
            </InfoGrid>
          </Section>
        </SoftBox>
      );

    case 3:
      return (
        <SoftBox>
          <SoftTypography variant="h6" mb={2} color="info" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
            Step 4: Create Pickup
          </SoftTypography>

          {/* Pickup Form */}
         <Grid container spacing={2} mb={2}>
  <Grid item xs={12} md={4}>
    <SoftTypography variant="body2" mb={1}>Pickup Date</SoftTypography>
    <TextField
      type="date"
      size="small"
      fullWidth
      InputLabelProps={{ shrink: false }}
      value={pickupDate}
      onChange={(e) => setPickupDate(e.target.value)}
    />
  </Grid>

  <Grid item xs={12} md={4}>
    <SoftTypography variant="body2" mb={1}>Pickup Time</SoftTypography>
    <TextField
      type="time"
      size="small"
      fullWidth
      InputLabelProps={{ shrink: false }}
      value={pickupTime}
      onChange={(e) => setPickupTime(e.target.value)}
    />
  </Grid>

  <Grid item xs={12} md={4}>
    <SoftTypography variant="body2" mb={1}>Office Close Time</SoftTypography>
    <TextField
      type="time"
      size="small"
      fullWidth
      InputLabelProps={{ shrink: false }}
      value={officeCloseTime}
      onChange={(e) => setOfficeCloseTime(e.target.value)}
    />
  </Grid>

  <Grid item xs={12} md={6}>
    <SoftTypography variant="body2" mb={1}>Package Count</SoftTypography>
    <TextField
      type="number"
      size="small"
      fullWidth
      inputProps={{ min: 1 }}
      value={packageCount}
      onChange={(e) => setPackageCount(e.target.value)}
    />
  </Grid>

  <Grid item xs={12} md={6}>
    <SoftTypography variant="body2" mb={1}>Carrier ID</SoftTypography>
    <TextField
      type="number"
      size="small"
      fullWidth
      value={carrierId}
      disabled
      onChange={(e) => setCarrierId(e.target.value)}
    />
  </Grid>
</Grid>


          <Section title="Pickup Summary">
            <InfoGrid>
              <InfoRow label="Pickup Date" value={stepData.pickup_date} />
              <InfoRow label="Pickup Time" value={stepData.pickup_time} />
              <InfoRow label="Office Close Time" value={stepData.office_close_time} />
              <InfoRow label="Package Count" value={stepData.package_count} />
              <InfoRow label="Carrier ID" value={stepData.carrier_id} />
              <InfoRow label="Warehouse ID" value={stepData.warehouse_id} />
              <InfoRow label="Return Warehouse ID" value={stepData.return_warehouse_id} />
              <InfoRow label="Payment Type" value={stepData.payment_type} />
              <InfoRow label="Order IDs" value={stepData.order_ids?.length > 0 ? `[${stepData.order_ids.join(", ")}]` : null} />
              <InfoRow label="Total Orders" value={stepData.order_ids?.length} />
            </InfoGrid>
          </Section>
        </SoftBox>
      );

    case 4:
      return (
        <SoftBox>
          <SoftTypography variant="h6" mb={2} color="info" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
            Step 5: Insert Order
          </SoftTypography>

          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12}>
              <Section title="Order & Tracking Information">
                <InfoGrid>
                  <InfoRow label="Order ID" value={stepData.order_id} />
                  <InfoRow label="Order Tracking Number" value={stepData.order_tracking_number} />
                  <InfoRow label="Carrier ID" value={stepData.carrier_id} />
                  <InfoRow label="Warehouse ID" value={stepData.warehouse_id} />
                  <InfoRow label="Return Warehouse ID" value={stepData.return_warehouse_id} />
                  <InfoRow label="Payment Type" value={stepData.payment_type} />
                  <InfoRow label="Order Total" value={stepData.order_total} prefix="₹" />
                  <InfoRow label="Email" value={stepData.email} />
                  <InfoRow label="Discount" value={stepData.discount} prefix="₹" />
                  <InfoRow label="Shipping" value={stepData.shipping} prefix="₹" />
                  <InfoRow label="Taxes" value={stepData.taxes} prefix="₹" />
                </InfoGrid>
              </Section>
            </Grid>

            <Grid item xs={12}>
              <Section title="Shipping Details">
                <InfoGrid>
                  <InfoRow label="Shipping Address" value={stepData.shipping_address} />
                  <InfoRow label="Shipping City" value={stepData.shipping_city} />
                  <InfoRow label="Shipping State" value={stepData.shipping_state} />
                  <InfoRow label="Shipping Country" value={stepData.shipping_country} />
                  <InfoRow label="Shipping Zipcode" value={stepData.shipping_zipcode} />
                  <InfoRow label="Shipping Firstname" value={stepData.shipping_firstname} />
                  <InfoRow label="Shipping Lastname" value={stepData.shipping_lastname} />
                  <InfoRow label="Shipping Phone" value={stepData.shipping_phone} />
                </InfoGrid>
              </Section>
            </Grid>
          </Grid>
        </SoftBox>
      );

    case 5:
      return (
        <SoftBox textAlign="center" py={4}>
          <Icon sx={{ fontSize: "48px", color: "#22c55e", mb: 2 }}>check_circle</Icon>
          <SoftTypography variant="h5" color="success" mb={1}>
            All Steps Completed!
          </SoftTypography>
          <SoftTypography variant="body2" color="text">
            Your order has been successfully processed through all Shipway steps.
          </SoftTypography>
          {awbResponse && (
            <Card sx={{ p: 2, backgroundColor: "#f0f9ff", mt: 2, maxWidth: "400px", mx: "auto" }}>
              <SoftTypography variant="subtitle2" mb={1} color="info">Final Details</SoftTypography>
              <SoftTypography variant="caption" display="block">Order ID: {order?.orderId}</SoftTypography>
              <SoftTypography variant="caption" display="block">AWB: {awbResponse.AWB}</SoftTypography>
            </Card>
          )}
        </SoftBox>
      );

    default:
      return null;
  }
};


  return (
<Dialog
  open={open}
  onClose={onClose}
  maxWidth={false} // disable preset size
  fullWidth
  PaperProps={{
    sx: {
      width: "95vw",   // almost full width
      height: "90vh",  // taller
      maxWidth: "1200px", // optional max bound
      borderRadius: 3
    }
  }}
>      <DialogTitle>
        <SoftBox display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <SoftBox display="flex" flexDirection="column">
            <SoftTypography variant="h6" mb={2}>Shipway Integration - {order?.orderId}</SoftTypography>
            <CustomStepper />
          </SoftBox>

        </SoftBox>
      </DialogTitle>

      {/* Shipment Actions below the title */}
      <SoftBox px={3} pb={1}>
        <SoftTypography variant="button" fontWeight="medium" color="dark" mb={1} display="block">
          Shipment Actions
        </SoftTypography>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              value={shipmentAction}
              onChange={(e) => setShipmentAction(e.target.value)}
              SelectProps={{ native: true }}
              disabled={currentStep < 5}
            >
              <option value="">Select Action</option>
              <option value="cancel">Cancel Shipment</option>
              <option value="onhold">Put On Hold</option>
            </TextField>
          </Grid>
          <Grid item>
            <SoftButton
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#fb923c",
                color: "#fff",
                "&:hover": { backgroundColor: "#f97316" },
                "&.Mui-disabled": { backgroundColor: "#fb923c", color: "#fff", opacity: 0.6 }
              }}
              disabled={currentStep < 5}
              onClick={async () => {
                if (!shipmentAction) return;
                if (shipmentAction === "cancel") {
                  await handleCancelShipment();
                } else if (shipmentAction === "onhold") {
                  await handleOnHold();
                }
              }}
            >
              Apply
            </SoftButton>
          </Grid>

          {/* View button on the right end of the same row */}
          <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SoftButton
              variant="outlined"
              size="small"
              color="info"
              onClick={() => onOpenShipmentDetails && onOpenShipmentDetails(order?.orderId)}
              disabled={!order?.orderId}
            >
              View
            </SoftButton>
          </Grid>
        </Grid>
      </SoftBox>
      
      <DialogContent dividers sx={{ minHeight: 400, maxHeight: 600, overflow: "auto" }}>
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <SoftButton onClick={onClose} variant="outlined" color="secondary" size="small">
          Close
        </SoftButton>
        {currentStep < 5 && (
          <SoftButton
            onClick={handleNextStep}
            variant="gradient"
            color="info"
            size="small"
            disabled={(currentStep === 1 && !selectedWarehouse) || isProcessing}
          >
            {isProcessing ? "Processing..." : currentStep === 4 ? "Complete" : "Next Step"}
          </SoftButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

ShipwayStepsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  onOpenShipmentDetails: PropTypes.func,
};


// Main OrderList Component
function OrderList() {
  const { check, loading } = usePermissions();
  const [menu, setMenu] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [packageItems, setPackageItems] = useState([]);
  const [shipwayModalOpen, setShipwayModalOpen] = useState(false);
  const [vendorDetailsDialogOpen, setVendorDetailsDialogOpen] = useState(false);

  // Persist packageReady per order in localStorage
  const getPkgKey = (orderId) => `packageReady:${orderId}`;
  const loadPackageReady = (orderId) => {
    try {
      return localStorage.getItem(getPkgKey(orderId)) === 'true';
    } catch {
      return false;
    }
  };
  const savePackageReady = (orderId, value) => {
    try {
      localStorage.setItem(getPkgKey(orderId), value ? 'true' : 'false');
    } catch {}
  };
  const clearPackageReady = (orderId) => {
    try { localStorage.removeItem(getPkgKey(orderId)); } catch {}
  };

  // Shipment details modal state
  const [shipmentDetailsOpen, setShipmentDetailsOpen] = useState(false);
  const [shipmentDetailsLoading, setShipmentDetailsLoading] = useState(false);
  const [shipmentDetailsData, setShipmentDetailsData] = useState(null);
  const [shipmentDetailsOrderId, setShipmentDetailsOrderId] = useState("");
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
const [selectedOrderItems, setSelectedOrderItems] = useState([]);
const [activeItem, setActiveItem] = useState(null);
const [vendorOrderId, setVendorOrderId] = useState("");
const [vendorSuggestions, setVendorSuggestions] = useState("");
const [selectedVendorName, setSelectedVendorName] = useState(""); // stores the selected vendor from suggestions
// Track originals to control Save enable/disable
const [originalVendorName, setOriginalVendorName] = useState("");
const [originalVendorOrderId, setOriginalVendorOrderId] = useState("");



  const [exportLoading, setExportLoading] = useState(false); // export Excel loading state
  // Force DataTable to remount (clears internal search input)
  const [tableKey, setTableKey] = useState(0);

  // Download Excel (all non-pending orders)
  const handleExportVendorSuggestions = async () => {
    try {
      setExportLoading(true);
      // Adjust path to your controller route if needed
      const res = await axiosInstance.get(`/order/admin/export-vendor-suggestions`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // try to extract filename from headers
      let filename = "orders_with_vendor_suggestions.xlsx";
      const disposition = res.headers?.["content-disposition"] || res.headers?.get?.("content-disposition");
      if (disposition) {
        const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire("Export failed", "Unable to download the Excel file.", "error");
      console.error(err);
    } finally {
      setExportLoading(false);
    }
  };

  const navigate = useNavigate();

  
  const [tableData, setTableData] = useState({
    columns: [
      { Header: "SI.NO", accessor: "si_no", width: "6%" },
      { Header: "Order ID", accessor: "orderId", width: "12%" },
      { Header: "Customer Name", accessor: "customerName", width: "18%" },
      { Header: "Status", accessor: "status", width: "12%" },
          { Header: "Vendors", accessor: "vendors", width: "12%" }, // ✅ NEW COLUMN

      { Header: "Shipment", accessor: "shipment", width: "12%" },
      { Header: "Actions", accessor: "actions", width: "12%" },
    ],
    rows: [],
  });

  const handleOpenVendors = async (order) => {
  setSelectedOrderItems(
    order.items.map(item => ({ ...item, orderId: order.orderId }))
  );
  setVendorDialogOpen(true);
  setActiveItem(null);
  setVendorSuggestions([]);
    setSelectedVendorName(""); // reset selected vendor
 // reset suggestions
};


  const getStatusProps = (status) => {
    switch (status) {
      case "confirmed":
        return { icon: "check_circle", color: "success" };
      case "shipped":
        return { icon: "local_shipping", color: "info" };
      case "out-for-delivery":
        return { icon: "local_mall", color: "warning" };
      case "delivered":
        return { icon: "done_all", color: "primary" };
      case "canceled":
        return { icon: "cancel", color: "error" };
      default:
        return { icon: "hourglass_empty", color: "warning" };
    }
  };

  const getNextStatus = (currentStatus) => {
    const normalized = currentStatus?.toLowerCase().trim();
    const index = statusFlow.indexOf(normalized);
    if (index === -1 || index === statusFlow.length - 1) return null;
    return statusFlow[index + 1];
  };

  // Helper function to update table data
  // Remove row-level cancel button; keep function if needed elsewhere or for future use
  const cancelShipmentByOrder = async (order) => {
    try {
      // Load saved AWB from localStorage if modal not opened yet
      const progress = JSON.parse(localStorage.getItem(`shipwayProgress:${order.orderId}`) || "{}")
      const awb = progress?.awbResponse?.AWB;
      if (!awb) {
        Swal.fire("No AWB", "AWB not available for this order yet.", "info");
        return;
      }

      const confirm = await Swal.fire({
        title: "Cancel Shipment?",
        text: `This will cancel AWB ${awb}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel",
      });
      if (!confirm.isConfirmed) return;

      const res = await axiosInstance.post(`/shipway/CancelShipment`, { awb_number: [awb] });
      const entry = res?.data?.data?.[0];
      if (res?.data?.success && entry && entry.success) {
        Swal.fire("Canceled", `Shipment for AWB ${awb} canceled.`, "success");
      } else {
        const msg = entry?.message || res?.data?.message || "Cancel request failed";
        Swal.fire("Failed", msg, "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Cancel request error", "error");
    }
  };

  const updateTableData = (ordersData) => {
    const rows = ordersData.map((order, index) => {
      const customerName = order.billingDetails
        ? `${order.billingDetails.first_name || ""} ${order.billingDetails.last_name || ""}`.trim()
        : "Unknown";

      const { icon, color } = getStatusProps(order.status);
      const nextStatus = getNextStatus(order.status);

      const canView = check("order_management", "manage_orders", "can_view");
      const canUpdate = check("order_management", "manage_orders", "can_update");
      const canReceive = check("order_management", "manage_orders", "can_update");

      const allReceived = order.items?.every((i) => i.received);
      const packageReady = !!order.packageReady;
      const canCreate = allReceived && packageReady;

      // ✅ Shipment Column: Always show Create, disabled until ready
      const shipmentButton = (
        <SoftBox display="flex" gap={1}>
          <SoftButton
            variant={canCreate ? "contained" : "outlined"}
            color={canCreate ? "info" : "secondary"}
            size="small"
            disableRipple
            disableFocusRipple
            disableElevation
            disabled={!canCreate}
            sx={{
              minWidth: "85px",
              height: "18px",
              fontSize: "0.65rem",
              px: 1,
              backgroundColor: canCreate ? "#22c55e" : "transparent",
              color: canCreate ? "#fff" : "#6b7280",
              border: canCreate ? "none" : "1px solid #6b7280",
            }}
            onClick={() => canCreate && setShipwayModalOpen(order)}
          >
            Ready
          </SoftButton>
        </SoftBox>
      );

      return {
        si_no: index + 1,
        orderId: order.orderId,
        customerName,
        status: <StatusCell icon={icon} color={color} status={order.status || "-"} />,
       vendors: (
  <SoftButton
    variant="outlined"
    color="info"
    size="small"
    onClick={() => handleOpenVendors(order)}
    sx={{
      minWidth: "85px",
      height: "18px",
      fontSize: "0.59rem",
      padding: "2px 6px",
    }}
  >
    Vendors
  </SoftButton>
),

        shipment: shipmentButton,
        actions: (
          <SoftBox display="flex" alignItems="center" gap={1}>
            <ActionCell
              order={{ ...order, nextStatus }}
              onView={(o) =>
                canView &&
                navigate(`/ecommerce/order_management/manage_orders/order-details/${o.orderId}`)
              }
              onEdit={(o) => {
                if (!canUpdate) return;
                setSelectedOrder(o);
                setNewStatus(nextStatus);
              }}
              onPackageReceived={(o) => handlePackageReceived(o)}
              canView={canView}
              canUpdate={canUpdate}
              canReceive={canReceive}
            />

          </SoftBox>
        ),
      };
    });

    setTableData((prev) => ({ ...prev, rows }));
  };




  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("/order/admin/allorders");
      let fetchedOrders = response.data.data || [];

      if (filterStatus) {
        fetchedOrders = fetchedOrders.filter(
          (order) => order.status?.toLowerCase() === filterStatus.toLowerCase()
        );
      }

      if (searchText) {
        const text = searchText.toLowerCase();
        fetchedOrders = fetchedOrders.filter((order) => {
          const customerName = order.billingDetails
            ? `${order.billingDetails.first_name} ${order.billingDetails.last_name}`.trim()
            : "";
          const productNames = order.items?.map((i) => i.name).join(", ") || "";
          return (
            order.orderId?.toLowerCase().includes(text) ||
            customerName.toLowerCase().includes(text) ||
            productNames.toLowerCase().includes(text)
          );
        });
      }

      // restore packageReady from localStorage per order
      const withPkgReady = fetchedOrders.map(o => ({
        ...o,
        packageReady: loadPackageReady(o.orderId)
      }));
      setOrders(withPkgReady);
      updateTableData(withPkgReady);
    } catch (error) {
      console.error(" Failed to fetch orders:", error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      setIsUpdating(true);
      await axiosInstance.put("/order/admin/update", {
        orderId: selectedOrder.orderId,
        status: newStatus,
      });

      Swal.fire("Success", "Order status updated successfully!", "success");

      setSelectedOrder(null);
      setNewStatus("");
      fetchOrders();
    } catch (err) {
      console.error(" Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch shipment details from Shipway
  const fetchShipmentDetails = async (orderId) => {
    try {
      setShipmentDetailsLoading(true);
      setShipmentDetailsData(null);
      const res = await axiosInstance.post(`/OrderDetails`, { order_id: orderId });
      if (res?.data?.success === "1") {
        setShipmentDetailsData(res.data);
      } else {
        Swal.fire("No Data", res?.data?.message || "No shipment details found", "info");
      }
    } catch (err) {
      console.error("Failed to fetch shipment details:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to fetch shipment details", "error");
    } finally {
      setShipmentDetailsLoading(false);
    }
  };

  const handlePackageReceived = async (order) => {
    try {
      const res = await axiosInstance.post(`/order/admin/view`, {
        orderId: order.orderId,
      });

      if (res.data.success) {
        setPackageItems(res.data.data.items || []);
        setSelectedOrder(order);
        setPackageModalOpen(true);
      } else {
        console.error(" Failed to fetch order items:", res.data.message);
      }
    } catch (err) {
      console.error(" Failed to fetch order items:", err);
    }
  };

 const handleCheckboxChange = async (item, checked) => {
  try {
    // await axiosInstance.post(`/order/admin/mark-received`, {
    await axiosInstance.post(`/order/admin/mark-received`,{
      orderId: selectedOrder.orderId,
      productId: item.productId,
      itemId: item.itemId,           // pass only itemId
      received: checked,
    });

    // Update packageItems state using productId + itemId
    const updatedItems = packageItems.map((i) =>
      i.productId === item.productId && i.itemId === item.itemId
        ? { ...i, received: checked }
        : i
    );
    setPackageItems(updatedItems);

    // Sync selectedOrder.items
    setSelectedOrder((prev) =>
      prev
        ? {
            ...prev,
            items: (prev.items || []).map((orderItem) =>
              orderItem.productId === item.productId &&
              orderItem.itemId === item.itemId
                ? { ...orderItem, received: checked }
                : orderItem
            ),
          }
        : prev
    );

    // Update main orders state
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === selectedOrder.orderId
          ? {
              ...order,
              items:
                order.items?.map((orderItem) =>
                  orderItem.productId === item.productId &&
                  orderItem.itemId === item.itemId
                    ? { ...orderItem, received: checked }
                    : orderItem
                ) || [],
            }
          : order
      )
    );
  } catch (err) {
    console.error("Error in handleCheckboxChange:", err);
    Swal.fire("Failed", "Could not update item", "error");
  }
};



  useEffect(() => {
    if (!loading) fetchOrders();
  }, [filterStatus, loading, searchText]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox my={3}>
        <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <SoftTypography variant="h5" fontWeight="medium">Orders</SoftTypography>
        </SoftBox>

        <Card>
          <SoftBox sx={{ overflowX: "auto" }}>
            <DataTable
              key={tableKey}
              table={tableData}
              entriesPerPage={false}
              canSearch
              rightActions={
                <SoftButton
                  variant="gradient"
                  color="info"
                  onClick={handleExportVendorSuggestions}
                  disabled={exportLoading}
                  sx={{ minWidth: "120px" }}
                >
                  <Icon sx={{ fontSize: "16px", mr: 1 }}>download</Icon>
                  {exportLoading ? "Exporting..." : "Vendor"}
                </SoftButton>
              }
            />
          </SoftBox>
        </Card>
      </SoftBox>

      <Footer />
<Dialog
  open={vendorDialogOpen}
  onClose={() => setVendorDialogOpen(false)}
  maxWidth="lg"
  fullWidth
  
  PaperProps={{
    sx: {
      borderRadius: "14px",
      overflow: "hidden",
      backgroundColor: "#fff",
      boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
    },
  }}
>
  {/* Header */}
  <SoftBox
    sx={{
      backgroundColor: "#22c55e",
      px: 2,
      py: 1.4,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <SoftTypography variant="h6" fontWeight="700" color="white">
      Vendor Management
    </SoftTypography>

    {/* White Close Icon */}
   
  </SoftBox>

  {/* Content */}
  <DialogContent sx={{ p: 3, maxHeight: "70vh" }}>
    <Card
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minHeight: "400px",
      }}
    >
      <SoftBox component="div" sx={{ overflowX: "auto", maxHeight: "60vh" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            fontSize: "0.85rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["SI.No","Image","Part Number","Manufacturer","Product Name","Qty","Action"].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px",
                      fontWeight: 600,
                      textAlign: "center",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {selectedOrderItems.map((item, index) => (
              <tr
                key={item.itemId}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: index % 2 === 0 ? "#fff" : "#f9fafb",
                }}
              >
                <td style={{ textAlign: "center", padding: "10px" }}>{index + 1}</td>
                <td style={{ textAlign: "center", padding: "10px" }}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name || "Product"}
                      style={{
                        width: "55px",
                        height: "55px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ) : "-"}
                </td>
                <td style={{ textAlign: "center", padding: "10px" }}>
                  {item.manufacturerPartNumber}
                </td>
                <td style={{ textAlign: "center", padding: "10px" }}>
                  {item.manufacturerName || "-"}
                </td>
                <td style={{ textAlign: "center", padding: "10px" }}>{item.name || "-"}</td>
                <td style={{ textAlign: "center", padding: "10px" }}>{item.qty}</td>
                <td style={{ textAlign: "center", padding: "10px" }}>
                  <SoftButton
                    size="small"
                    sx={{
                      backgroundColor: "#22c55e",
                      color: "#fff",
                      borderRadius: "6px",
                      px: 1.5,
                      fontSize: "0.75rem",
                      
                    }}
                    onClick={async () => {
                      setActiveItem({ ...item, orderId: item.orderId });
                      const savedName = item.vendorName || "";
                      const savedOrderId = item.vendorOrderId || "";
                      setVendorOrderId(savedOrderId);
                      setSelectedVendorName(savedName);
                      setOriginalVendorName(savedName);
                      setOriginalVendorOrderId(savedOrderId);
                      try {
                        const res = await axiosInstance.post(
                          `/order/admin/vendor/suggestions`,
                          {
                            items: [
                              {
                                manufacturerName: item.manufacturerName,
                                manufacturerPartNumber: item.manufacturerPartNumber,
                              },
                            ],
                          }
                        );
                        if (res.data.success)
                          setVendorSuggestions(res.data.data[0]?.vendorSuggestions || []);
                        else setVendorSuggestions([]);
                      } catch {
                        setVendorSuggestions([]);
                      }
                      setVendorDetailsDialogOpen(true);
                    }}
                  >
                    View
                  </SoftButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SoftBox>
    </Card>
  </DialogContent>
</Dialog>


<Dialog
  open={vendorDetailsDialogOpen}
  onClose={() => {
    setVendorDetailsDialogOpen(false);
    setVendorOrderId("");
    setSelectedVendorName("");
    setOriginalVendorName("");
    setOriginalVendorOrderId("");
  }}
  maxWidth="sm"
  fullWidth
  disableEnforceFocus
  disableAutoFocus
  PaperProps={{
    sx: {
      borderRadius: "16px",
      overflow: "hidden",
      backgroundColor: "#fff",
    },
  }}
>
  {/* Header */}
  <SoftBox
    sx={{
      backgroundColor: "#22c55e",
      px: 2,
      py: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px",
    }}
  >
    <SoftTypography variant="h6" fontWeight="700" color="white">
      Vendor Details
    </SoftTypography>
  </SoftBox>

  <DialogContent dividers>
    {activeItem && (
      <>
        {/* Prefill saved vendor values once */}
        {(() => {
          const savedName = activeItem.vendorName || "";
          const savedOrderId = activeItem.vendorOrderId || "";
          if (
            selectedVendorName === "" &&
            vendorOrderId === "" &&
            (savedName || savedOrderId)
          ) {
            setSelectedVendorName(savedName);
            setVendorOrderId(savedOrderId);
            setOriginalVendorName(savedName);
            setOriginalVendorOrderId(savedOrderId);
          }
          return null;
        })()}

        {/* Item Info */}
        <SoftTypography sx={{ mb: 2, fontSize: "0.9rem" }}>
          <strong>Manufacturer:</strong> {activeItem.manufacturerName} <br />
          <strong>Quantity:</strong> {activeItem.qty}
        </SoftTypography>

        {/* Suggestions */}
        <SoftTypography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 1 }}>
          Vendor Suggestions
        </SoftTypography>

        {vendorSuggestions.length > 0 ? (
          <select
            value={selectedVendorName}
            onChange={(e) => setSelectedVendorName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              marginBottom: "16px",
            }}
          >
            {originalVendorName &&
              !vendorSuggestions.includes(originalVendorName) && (
                <option value={originalVendorName}>
                  {originalVendorName} (saved)
                </option>
              )}
            <option value="">Select Vendor</option>
            {vendorSuggestions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ) : (
          <SoftTypography variant="body2" sx={{ mb: 2 }}>
            No suggestions available.
          </SoftTypography>
        )}

        {/* Vendor Order ID */}
        <SoftTypography sx={{ fontWeight: 600, fontSize: "0.85rem", mb: 1 }}>
          Vendor Order ID
        </SoftTypography>
        <input
          type="text"
          value={vendorOrderId}
          onChange={(e) => setVendorOrderId(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            marginBottom: "16px",
          }}
        />

        {/* Save */}
        <SoftButton
          fullWidth
          disabled={
            !selectedVendorName ||
            !vendorOrderId ||
            (selectedVendorName === originalVendorName &&
              vendorOrderId === originalVendorOrderId)
          }
          sx={{
            backgroundColor: "#22c55e",
            color: "#fff",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#16a34a !important",
              color: "#fff !important",
            },
            "&:disabled": {
              backgroundColor: "#22c55e !important",
              color: "#fff !important",
              cursor: "not-allowed",
            },
          }}
         onClick={async () => {
  try {
    const res = await axiosInstance.post(
      `/order/admin/vendor/mark-ordered`,
      {
        orderId: activeItem.orderId,
        itemId: activeItem.itemId,
        productId: activeItem.productId,
        vendorName: selectedVendorName,
        vendorOrderId,
      }
    );

    if (res.data.success) {
      Swal.fire("Saved", "Vendor details updated!", "success");

      // update local state so UI reflects changes immediately
      setSelectedOrderItems((prev) =>
        prev.map((i) =>
          i.itemId === activeItem.itemId
            ? {
                ...i,
                vendorName: selectedVendorName,
                vendorOrderId,
                productId: activeItem.productId,
              }
            : i
        )
      );

      fetchOrders(); 
      setTableKey((k) => k + 1);

      setVendorDetailsDialogOpen(false);
    } else {
      Swal.fire("Failed", res.data.message || "Could not save", "error");
    }
  } catch (err) {
    console.error("Save vendor error:", err);
    Swal.fire("Error", "Failed to save vendor details", "error");
  }
}}

        >
          Save
        </SoftButton>
      </>
    )}
  </DialogContent>
</Dialog>








      {/* Update Status Modal */}
      <Dialog
        open={!!selectedOrder && !!newStatus}
        onClose={() => setSelectedOrder(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <>
              <p>
                <strong>Order ID:</strong> {selectedOrder.orderId}
              </p>
              <p>
                <strong>Current Status:</strong> {selectedOrder.status}
              </p>
              {newStatus ? (
                <p>
                  <strong>Next Status:</strong> {newStatus}
                </p>
              ) : (
                <p style={{ color: "gray" }}>This order has already reached the final status.</p>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <SoftButton
            onClick={() => setSelectedOrder(null)}
            disabled={isUpdating}
            variant="outlined"
            color="secondary"
            size="small"
          >
            Cancel
          </SoftButton>
          <SoftButton
            onClick={handleStatusUpdate}
            disabled={isUpdating || !newStatus}
            variant="gradient"
            color="info"
            size="small"
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </SoftButton>
        </DialogActions>
      </Dialog>

      {/* Package Received Modal */}
 <Dialog
  open={packageModalOpen}
  onClose={() => {
    setPackageModalOpen(false);   // close this modal
    setSelectedOrder(null);       // reset selected order to prevent other popups
  }}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Package Received</DialogTitle>
  <DialogContent dividers>
    {packageItems.map((item) => (
      <SoftBox
        key={item.productId}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <SoftBox display="flex" alignItems="center" gap={2}>
          <img
            src={item.image_url || ""}
            alt={item.name}
            style={{
              width: "60px",
              height: "60px",
              objectFit: "contain",
              borderRadius: "6px",
              border: "1px solid #eee",
            }}
          />
          <SoftBox>
            <p style={{ margin: 0, fontWeight: 400, fontSize: "0.9rem" }}>
              {item.manufacturerPartNumber} | (Qty: {item.qty})
            </p>
          </SoftBox>
        </SoftBox>

        <SoftBox display="flex" alignItems="center" gap={1}>
          <Checkbox
            checked={item.received || false}
            onChange={(e) => handleCheckboxChange(item, e.target.checked)}
          />
        </SoftBox>
      </SoftBox>
    ))}

    <Divider sx={{ my: 1 }} />

    <SoftBox display="flex" alignItems="center" gap={1} mt={1}>
      <Tooltip
        title={
          selectedOrder?.packageReady
            ? "Already marked as Package Ready"
            : !packageItems?.every((i) => i.received)
            ? "Mark all items as received to enable"
            : ""
        }
        placement="top"
      >
        <span>
          <Checkbox
            checked={!!selectedOrder?.packageReady}
            disabled={
              !packageItems?.every((i) => i.received) ||
              !!selectedOrder?.packageReady
            }
            onChange={(e) => {
              if (!packageItems?.every((i) => i.received)) return;
              const checked = e.target.checked;
              if (!checked && selectedOrder?.packageReady) return;

              setSelectedOrder((prev) =>
                prev ? { ...prev, packageReady: checked } : prev
              );
              savePackageReady(selectedOrder.orderId, checked);

              setOrders((prev) => {
                const updated = prev.map((o) =>
                  o.orderId === selectedOrder.orderId
                    ? { ...o, packageReady: checked }
                    : o
                );
                updateTableData(updated);
                return updated;
              });

              if (checked) {
                setPackageModalOpen(false);
                setSelectedOrder(null); // reset to avoid triggering other modals
              }
            }}
          />
        </span>
      </Tooltip>
      <SoftTypography variant="button">Package Ready</SoftTypography>
    </SoftBox>
  </DialogContent>

  <DialogActions>
    <SoftButton
      onClick={() => {
        setPackageModalOpen(false);
        setSelectedOrder(null); // reset selected order
      }}
      variant="outlined"
      color="secondary"
      size="small"
    >
      Close
    </SoftButton>
  </DialogActions>
</Dialog>






      {/* Shipment Details Modal */}
      <Dialog
        open={shipmentDetailsOpen}
        onClose={() => setShipmentDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Shipment Details - {shipmentDetailsOrderId}</DialogTitle>
        <DialogContent dividers>
          {shipmentDetailsLoading ? (
            <SoftTypography variant="body2">Loading...</SoftTypography>
          ) : shipmentDetailsData ? (
            <SoftBox>
              {/* Shipment Status History */}
              <Card sx={{ p: 2, mb: 2 }}>
                <SoftTypography variant="subtitle2" mb={1}>Shipment Status History</SoftTypography>
                {shipmentDetailsData.shipment_status_history?.length ? (
                  shipmentDetailsData.shipment_status_history.map((s, idx) => (
                    <SoftBox key={idx} mb={1}>
                      <SoftTypography variant="caption" display="block">
                        <strong>{s.name}</strong>
                      </SoftTypography>
                      <SoftTypography variant="caption" display="block">
                        {s.time}
                      </SoftTypography>
                      {s.ndr_reason && (
                        <SoftTypography variant="caption" display="block">
                          NDR Reason: {s.ndr_reason}
                        </SoftTypography>
                      )}
                      {idx < shipmentDetailsData.shipment_status_history.length - 1 && <Divider sx={{ my: 1 }} />}
                    </SoftBox>
                  ))
                ) : (
                  <SoftTypography variant="caption">No status history available.</SoftTypography>
                )}
              </Card>

              {/* Customer Response History */}
              <Card sx={{ p: 2 }}>
                <SoftTypography variant="subtitle2" mb={1}>Customer/Merchant Action History</SoftTypography>
                {shipmentDetailsData.customer_response_history?.length ? (
                  shipmentDetailsData.customer_response_history.map((h, idx) => (
                    <SoftBox key={idx} mb={1}>
                      <SoftTypography variant="caption" display="block">
                        <strong>{h.action_taken}</strong> by {h.action_taken_by} on {h.action_date}
                      </SoftTypography>
                      {h.history && (
                        <SoftTypography variant="caption" display="block">
                          {Object.entries(h.history).map(([k, v]) => `${k}: ${v}`).join(" | ")}
                        </SoftTypography>
                      )}
                      {idx < shipmentDetailsData.customer_response_history.length - 1 && <Divider sx={{ my: 1 }} />}
                    </SoftBox>
                  ))
                ) : (
                  <SoftTypography variant="caption">No customer response history available.</SoftTypography>
                )}
              </Card>
            </SoftBox>
          ) : (
            <SoftTypography variant="body2">No data</SoftTypography>
          )}
        </DialogContent>
        <DialogActions>
          <SoftButton
            onClick={() => setShipmentDetailsOpen(false)}
            variant="outlined"
            color="secondary"
            size="small"
          >
            Close
          </SoftButton>
        </DialogActions>
      </Dialog>

      {/* Shipway Steps Modal */}
      <ShipwayStepsModal
        key={shipwayModalOpen?.orderId || "no-order"}
        open={!!shipwayModalOpen}
        onClose={() => setShipwayModalOpen(false)}
        order={shipwayModalOpen}
        onOpenShipmentDetails={(orderId) => {
          setShipmentDetailsOrderId(orderId);
          setShipmentDetailsOpen(true);
          fetchShipmentDetails(orderId);
        }}
      />
    </DashboardLayout>
  );
}

export default OrderList;
