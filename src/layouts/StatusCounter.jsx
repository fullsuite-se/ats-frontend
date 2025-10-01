import React, { useEffect, useState } from "react";
import { usePositions } from "../hooks/usePositions";
import { useStages, handleStageClick } from "../hooks/useStages";
import { useCollapse } from "../hooks/useCollapse";
import { filterCounter, clearSelections } from "../services/statusCounterService";
import { initialStages } from "../data/stages";
import { filterApplicants } from "../services/applicantService";
import positionStore from "../context/positionStore";
import applicantFilterStore from "../context/applicantFilterStore";
import applicantDataStore from "../context/applicantDataStore";
import { MdDeselect } from "react-icons/md";
import moment from "moment";

export default function StatusCounter() {
  const positions = usePositions();
  const { stages, setStages, toggleStage, toggleStatus } = useStages();
  const { collapsedStages, toggleCollapse } = useCollapse();
  const { positionFilter, setPositionFilter } = positionStore();
  const { status, setStatus, setStatusStage, clearStatus, search, setSearch, dateFilter, dateFilterType, setSelectedDate } = applicantFilterStore();
  const { setApplicantData } = applicantDataStore();
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Check if at least one status is selected
  const hasSelectedStatus = stages.some((stage) =>
    stage.statuses.some((status) => status.selected),
  );

  useEffect(() => {
    setSelectedStatuses([]);
  }, [search]);

  // Clean positions by trimming titles
  const cleanedPositions = positions.map(position => ({
    ...position,
    title: position.title.trim()
  }));

  const handlePositionChange = (selectedValue) => {
    const trimmedPosition = selectedValue.trim();
    
    console.log('Position selected:', JSON.stringify(trimmedPosition));
    
    filterCounter(
      trimmedPosition,
      setStages,
      initialStages,
      setPositionFilter,
      selectedStatuses,
    );
    filterApplicants(trimmedPosition, setApplicantData, status, setSearch);
  };

  const handleStatusClick = (Status) => {
    setSearch("");
    toggleStatus(
      Status.stageName,
      Status.name,
      Status.value,
      positionFilter,
      setApplicantData,
    );
    
    setSelectedStatuses((prevStatuses) => {
      const updatedStatuses = prevStatuses.includes(Status.value)
        ? prevStatuses.filter(status => status !== Status.value)
        : [...prevStatuses, Status.value];
      
      dateFilterType === 'month'
        ? filterApplicants(positionFilter, setApplicantData, updatedStatuses, moment(dateFilter).format("MMMM"), dateFilterType)
        : filterApplicants(positionFilter, setApplicantData, updatedStatuses, moment(dateFilter).format("YYYY"), dateFilterType);
      
      return updatedStatuses;
    });
    
    setStatus(Status.value);
  };

  const handleStageButtonClick = (stage) => {
    setSearch("");
    handleStageClick(stage, setSelectedStatuses, search, toggleStage, dateFilterType, dateFilter, positionFilter, setApplicantData, setStatusStage);
  };

  return (
    <div className="border-gray-light mx-auto w-full rounded-3xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between rounded-lg">
        <h2 className="headline text-gray-dark md:mb-0">Status Counter</h2>

        <div className="items-center flex gap-2">
          {/* Show Clear Button if any status is selected */}
          {hasSelectedStatus && (
            <div
              className="text-end body-tiny text-gray-dark border border-gray-light hover:bg-gray-light rounded-md cursor-pointer p-0.5"
              data-tooltip-target="clear"
              title="Clear"
              onClick={() => clearSelections(stages, setStages, setSelectedStatuses, clearStatus, setStatus, setPositionFilter, setApplicantData, dateFilter, dateFilterType)}
            >
              <MdDeselect
                className="w-5 h-5 text-gray-dark hover:bg-gray-light rounded-2xl cursor-pointer"
              />
            </div>
          )}

          <select
            className="border-gray-light max-w-[120px] rounded-md border p-1 text-sm"
            onChange={(e) => handlePositionChange(e.target.value)}
            value={positionFilter}
          >
            <option value="All">All Positions</option>
            {cleanedPositions.map((position) => (
              <option key={position.job_id} value={position.title}>
                {position.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {stages.map((stage) => (
          <div key={stage.name}>
            {/* Stage Button */}
            <div
              className={`flex cursor-pointer items-center justify-between ${
                stage.selected
                  ? "bg-teal text-white"
                  : "bg-gray-light text-gray-dark"
              } hover:bg-teal-soft mb-2 rounded-md px-2`}
              onClick={() => handleStageButtonClick(stage)}
            >
              <div className="flex flex-1 items-center justify-between">
                <span className="body-bold">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{stage.count}</span>
                  <span
                    className="hover:text-gray-light text-red-soft"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(stage.name);
                    }}
                  >
                    {collapsedStages[stage.name] ? "▼" : "▲"}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Buttons - Collapsible */}
            {!collapsedStages[stage.name] && (
              <div className="space-y-1.5 overflow-hidden">
                {stage.statuses.map((Status) => (
                  <div
                    onClick={() => handleStatusClick({...Status, stageName: stage.name})}
                    key={Status.name}
                    className={`mx-1 flex items-center justify-between rounded-lg border px-3 py-0.5 ${
                      Status.selected
                        ? "border-teal-soft bg-teal-soft"
                        : "border-gray-light"
                    } hover:bg-gray-light`}
                  >
                    <span className="body-regular text-gray-dark">
                      {Status.name}
                    </span>
                    <span className="headline">{Status.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}