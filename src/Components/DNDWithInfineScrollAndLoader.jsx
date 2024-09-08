import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaChevronRight } from "react-icons/fa";
import axios from "axios";

const initialData = {
  pagination: {
    "column-1": {
      collapse: false,
      currentPage: 1,
      pageSize: 10,
      title: "HOLD",
      totalItem: 18,
      totalPage: 2,
    },
    "column-2": {
      collapse: false,
      currentPage: 1,
      pageSize: 10,
      title: "HOLD",
      totalItem: 18,
      totalPage: 2,
    },
    "column-3": {
      collapse: false,
      currentPage: 1,
      pageSize: 10,
      title: "HOLD",
      totalItem: 18,
      totalPage: 2,
    },
  },
  tasks: {
    "task-1": { id: "task-1", content: "Task 1", _id: "" },
    "task-2": { id: "task-2", content: "Task 2", _id: "" },
    "task-3": { id: "task-3", content: "Task 3", _id: "" },
    "task-4": { id: "task-4", content: "Task 4", _id: "" },
    "task-5": { id: "task-5", content: "Task 5", _id: "" },
    "task-6": { id: "task-6", content: "Task 6", _id: "" },
    "task-7": { id: "task-7", content: "Task 7", _id: "" },
    "task-8": { id: "task-8", content: "Task 8", _id: "" },
    "task-9": { id: "task-9", content: "Task 9", _id: "" },
    "task-10": { id: "task-10", content: "Task 10", _id: "" },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
  columns: {
    "column-1": {
      id: "column-1",
      title: "OPEN",
      taskIds: ["task-1", "task-2", "task-3"],
    },
    "column-2": {
      id: "column-2",
      title: "IN PROGRESS",
      taskIds: ["task-4", "task-5", "task-6"],
    },
    "column-3": {
      id: "column-3",
      title: "HOLD",
      taskIds: ["task-7", "task-8", "task-9", "task-10"],
    },
  },
};

const App = () => {
  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjY1NzgyZTVlNjkxMDkxMWQyOTcwNzhlMiIsIm5hbWUiOiJDb2Rpb3RpYyIsInVzZXJUeXBlIjoiU1VQRVJfQURNSU4iLCJ0b2tlblR5cGUiOiJMT0dJTiIsImlhdCI6MTcxNTA4MDAyNywiZXhwIjoxNzE1MzQ2NDI3fQ.VaHMF0KyGXKMvyeeNGvFuX6tJAw5eGqYtIQtk3j_BAA";
  const USER_ID = "65782e5e6910911d297078e2";

  const [state, setState] = useState(initialData);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    const taskMongoId = draggableId?.split("-")?.[1];
    const taskDestinationStatus = destination?.droppableId?.split("-")?.[0];

    // Return if there's no destination or if the item is dropped back to its original position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const startColumn = state.columns[source.droppableId];
    const finishColumn = state.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn,
        },
      };

      setState(newState);
    } else {
      // Moving to a different column
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStartColumn = {
        ...startColumn,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(finishColumn.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinishColumn = {
        ...finishColumn,
        taskIds: finishTaskIds,
      };

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newStartColumn.id]: newStartColumn,
          [newFinishColumn.id]: newFinishColumn,
        },
      };

      // this is the task status change api
      let reportData = {
        assignedTo: USER_ID,
        requestedLabel: taskDestinationStatus,
      };

      axios
        .put(
          `https://cc-api.codioticdemo.com/v1/task/change-label/${taskMongoId}`,
          reportData,
          {
            headers: {
              "Content-Type": "application/json",
              "x-access-token": TOKEN,
            },
          }
        )
        .then((res) => {
          if (res?.data?.data?.status) {
            // If the API call is successful, update the state
            // setState(newState);
          } else {
            // If the API call fails, log the error and revert the state
            return setState(state);
          }
        })
        .catch((err) => {
          // If there's an error with the API call, revert the state
          return setState(state);
        });
      setState(newState);
    }
  };

  const fetchData = (taskStatus, currentPage) => {
    const reportData = {
      limit: 10,
      searchValue: "",
      params: ["projectName"],
      page: currentPage,
      filterBy: [
        {
          fieldName: "status",
          value: taskStatus === "" ? "" : taskStatus,
        },
      ],
      dateFilter: {},
      orderBy: "createdAt",
      orderByValue: -1,
      isPaginationRequired: true,
    };

    axios
      .post("https://cc-api.codioticdemo.com/v1/task", reportData, {
        headers: {
          "Content-Type": "application/json",
          "x-access-token": TOKEN,
        },
      })
      .then((response) => {
        // Process the response data
        const newData = response.data.data;

        // Update the state by appending new data to the existing data
        setState((prevState) => {
          const updatedTasks = { ...prevState.tasks };
          const updatedColumns = { ...prevState.columns };
          const updatedPaginations = { ...prevState.pagination };

          // Update tasks with new data
          newData.forEach((task) => {
            const key = "taks-" + task._id;
            updatedTasks[key] = {
              id: key,
              content: task.title,
              taskNumber: task.taskNumber,
              _id: task._id,
            };
          });

          // Update columns with new task ids
          Object.keys(prevState.columns).forEach((columnId) => {
            const column = prevState.columns[columnId];
            const paginationCol = prevState.pagination[columnId];
            if (column.title === taskStatus) {
              const updatedColumn = {
                ...column,
                taskIds: [
                  ...column.taskIds,
                  ...newData.map((task) => "taks-" + task._id),
                ],
              };

              const updatedPaginationCol = {
                ...paginationCol,
                currentPage: paginationCol.currentPage + 1,
              };

              updatedColumns[columnId] = updatedColumn;
              updatedPaginations[columnId] = updatedPaginationCol;
            }
          });

          return {
            ...prevState,
            tasks: updatedTasks,
            columns: updatedColumns,
            pagination: updatedPaginations,
          };
        });
      })
      .catch((error) => {
        console.error("Error submitting report:", error);
      });
  };

  // *************************** USEEFFECT INITIAL DATA **********************************
  useEffect(() => {
    // Convert FileList to array
    const fileListArray = [
      "OPEN",
      "HOLD",
      "IN_PROGRESS",
      "TODO",
      "BUGS",
      "UAT_REVIEW",
      "COMPLETE",
      "DONE",
      "BLOCKING",
      "ISSUE",
      "CLOSE",
      "ARCHIVED",
    ];

    // Array to store all upload promises
    const uploadPromises = [];

    // Iterate through each file in the file list
    fileListArray.forEach((status, index) => {
      // Push the promise returned by the uploadFile function into the array
      const reportData = {
        limit: 10,
        searchValue: "",
        params: ["projectName"],
        page: 1,
        filterBy: [
          {
            fieldName: "status",
            value: status,
          },
        ],
        dateFilter: {},
        orderBy: "createdAt",
        orderByValue: -1,
        isPaginationRequired: true,
      };

      uploadPromises.push(
        axios
          .post("https://cc-api.codioticdemo.com/v1/task", reportData, {
            headers: {
              "Content-Type": "application/json",
              "x-access-token": TOKEN,
            },
          })
          .then((response) => {
            return response;
          })
      );

      Promise.all(uploadPromises)
        .then((response) => {
          // Create the pagination with each task status and hold the first fetched pagination data
          const paginationKeyObj = response?.map((ele, ind) => {
            return {
              collapse: false,
              title: fileListArray[ind],
              currentPage: ele?.data?.currentPage || 0,
              pageSize: ele?.data?.pageSize || 0,
              totalItem: ele?.data?.totalItem || 0,
              totalPage: ele?.data?.totalPage || 0,
            };
          });

          const pagination = {};
          paginationKeyObj?.forEach((ele, pageInd) => {
            const keys = `${ele.title}-` + (pageInd + 1);
            pagination[keys] = {
              ...ele,
            };
          });

          const firstBoardInitialData = response?.map(
            (ele) => ele?.data?.data || []
          );

          const uniqueColumns = Array.from(new Set(fileListArray));

          const findingTheTaskKeysWithStatus = uniqueColumns?.map((ele) => {
            const filteredTask = firstBoardInitialData
              ?.flat(1)
              ?.filter((filterTask) => filterTask.status === ele);

            const keysOfTaskNumber = filteredTask?.map(
              (taskNum) => "taks-" + taskNum?._id
            );

            return {
              title: ele,
              tasks: keysOfTaskNumber || [""],
            };
          });

          const dummyData = {
            pagination,
            tasks: {},
            columnOrder: uniqueColumns?.map((_, ind) => `${_}-${ind + 1}`), // ["column-1", "column-2", "column-3"],
            columns: {},
          };

          // get & set the columns with itrate column-1
          const columns = {};
          findingTheTaskKeysWithStatus.forEach((title, index) => {
            const key = `${title.title}-${index + 1}`;
            columns[key] = {
              id: key,
              title: title?.title,
              taskIds: title?.tasks || [], //tasks[index]
            };
          });
          dummyData.columns = columns; // set the data in dummyData

          // get & set task with diffrent diffrent task id's
          const tasks = {};
          firstBoardInitialData?.flat(1).forEach((task, index) => {
            const key = "taks-" + task?._id;
            tasks[key] = {
              id: key,
              content: task.title,
              taskNumber: task.taskNumber,
              _id: task._id,
            };
          });

          dummyData.tasks = tasks; // set the data in dummyData
          setState(dummyData);
        })
        .catch((err) => {
          console.error("error => ", err);
        });
    });
  }, []);

  // get the total boards of width
  const getTotalBoardsWidth = () => state.columnOrder.length * 366;

  const handleScroll = (columnId, e, currentPage, totalPage) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const taskStatus = columnId.split("-")[0];

    const scrolledToBottom = scrollHeight - scrollTop === clientHeight;

    if (scrolledToBottom && currentPage < totalPage) {
      fetchData(taskStatus, currentPage + 1);
    }
  };

  const handleCollapse = (columnId, currentCollapseValue) => {
    const taskStatus = columnId.split("-")[0];

    // Update the state by appending new data to the existing data
    setState((prevState) => {
      const updatedPaginations = { ...prevState.pagination };

      // Update columns with new task ids
      Object.keys(prevState.columns).forEach((columnId) => {
        const column = prevState.columns[columnId];
        const paginationCol = prevState.pagination[columnId];
        if (column.title === taskStatus) {
          const updatedPaginationCol = {
            ...paginationCol,
            collapse: !paginationCol.collapse,
          };

          updatedPaginations[columnId] = updatedPaginationCol;
        }
      });

      return {
        ...prevState,
        pagination: updatedPaginations,
      };
    });
  };

  return (
    <div
      className="flex gap-[20px] mt-[50px] ml-[50px] mr-[50px]"
      style={{
        width: getTotalBoardsWidth(),
        overflowY: "auto",
        height: "85vh",
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        {state.columnOrder.map((columnId) => {
          const column = state.columns[columnId];
          const pagination = state.pagination[columnId];
          const collapse = state?.pagination?.[columnId]?.collapse || false;
          const totalItem = state.pagination[columnId].totalItem;
          return (
            <div
              title={column.title}
              onScroll={(e) => {
                handleScroll(
                  column.id,
                  e,
                  pagination.currentPage,
                  pagination.totalPage
                );
              }}
              key={column.id}
              className={`${
                !collapse
                  ? "w-[366px] overflow-auto "
                  : "w-[35px] overflow-hidden"
              } bg-[#fafafa] h-full  transition-all border-[#dbdbdb] border-[1px] rounded-[0.25rem]`}
            >
              <div
                className={`sticky top-0 flex gap-[5px] justify-between items-center bg-[#fafafa] text-[0.875rem] box-border leading-[1.2] text-[#303030] 
                           font-semibold mb-[10px] h-[50px] px-[0.5rem] ${
                             !collapse && "border-b-[#dbdbdb] border-b-[1px]"
                           }`}
              >
                <div className="flex gap-[4px] items-center relative">
                  <span
                    onClick={() =>
                      handleCollapse(column.id, pagination.collapse)
                    }
                    className={`transition-all hover:bg-gray-200 rounded flex-shrink-0 overflow-hidden cursor-pointer p-1 ${
                      collapse && "rotate-90 absolute left-[1px]"
                    }`}
                  >
                    <FaChevronRight color="#666" size={10} />
                  </span>
                  {/* Board Title Status */}
                  <span
                    className={`${
                      collapse && "rotate-90 absolute top-10 -left-[9px] inline"
                    }`}
                  >
                    {column.title}
                  </span>
                </div>

                {/* Board Tasks Status Count */}
                {!collapse && totalItem ? (
                  <div className="bg-[#000000] text-[#fafafa] rounded-[8px] p-[5px]">
                    {totalItem}
                  </div>
                ) : null}
              </div>

              {/* Add min height to the droppable area */}
              <Droppable droppableId={column.id} style={{ minHeight: "100px" }}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: "100px" }}
                  >
                    {column.taskIds.map((taskId, index) => {
                      const task = state.tasks[taskId];

                      return (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="w-[18px] h-[18px] border-[2px] border-[#1a19197a] border-t-[#000] rounded-full animate-spin ease-in hidden "></div>
                              {!collapse ? (
                                <div
                                  className="mt-0 mb-[10px] mx-[10px] w-auto overflow-hidden p-[1rem] cursor-grab rounded-[0.25rem] 
                                         bg-[#fff] text-[14px] text-[#303030] font-semibold border-[0.5px] border-[#dbdbdb]"
                                >
                                  {task.content}
                                  <div>
                                    <span className="leading-[10px] text-[#666] whitespace-normal box-border font-normal text-[12px]">
                                      #{task.taskNumber}
                                    </span>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    <div className="flex justify-center text-xs font-semibold">
                      {column.taskIds.length >= 10 ? (
                        column.taskIds.length === totalItem ? (
                          <span>Showing all issues</span>
                        ) : (
                          <div className="flex justify-center flex-col items-center">
                            <div className="w-[18px] h-[18px] border-[2px] border-[#1a19197a] border-t-[#000] rounded-full animate-spin ease-in "></div>
                            Showing {column.taskIds.length} item of {totalItem}
                          </div>
                        )
                      ) : null}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
};

export default App;
