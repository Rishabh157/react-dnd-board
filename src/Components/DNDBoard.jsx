import React, { useEffect, useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaChevronRight } from "react-icons/fa";
import axios from "axios";

const initialData = {
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
  // const [state, setState] = useState();
  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjY1NzgyZTVlNjkxMDkxMWQyOTcwNzhlMiIsIm5hbWUiOiJDb2Rpb3RpYyIsInVzZXJUeXBlIjoiU1VQRVJfQURNSU4iLCJ0b2tlblR5cGUiOiJMT0dJTiIsImlhdCI6MTcxNDgxMzU0NCwiZXhwIjoxNzE1MDc5OTQ0fQ.C_mf2WYtPAioJ2MVeYmXvXtOcrEsfGO079MsJH-nTq0";
  const USER_ID = "65782e5e6910911d297078e2";

  const [state, setState] = useState(initialData);
  const [collapse, setCollapse] = useState(false);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const containerRef = useRef(null);

  const onDragEnd = (result) => {
    console.log("result: ", result);
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
            console.log("res++++++++++++", res?.data?.status);
            // If the API call is successful, update the state
            // setState(newState);
          } else {
            // If the API call fails, log the error and revert the state
            console.log("API call failed");
            return setState(state);
          }
        })
        .catch((err) => {
          console.log(err);
          // If there's an error with the API call, revert the state
          return setState(state);
        });
      setState(newState);
    }
  };

  // const onDragEnd = (result) => {
  //   console.log("result: ", result);
  //   const { destination, source, draggableId } = result;

  //   const taskMongoId = draggableId?.split("-")?.[1];
  //   const taskDestinationStatus = destination?.droppableId?.split("-")?.[0];
  //   // console.log("taskMongoId: ", taskMongoId, taskDestinationStatus);

  //   // Return if there's no destination or if the item is dropped back to its original position
  //   if (
  //     !destination ||
  //     (destination.droppableId === source.droppableId &&
  //       destination.index === source.index)
  //   ) {
  //     return;
  //   }

  //   const startColumn = state.columns[source.droppableId];
  //   const finishColumn = state.columns[destination.droppableId];

  //   // Moving within the same column
  //   if (startColumn === finishColumn) {
  //     const newTaskIds = Array.from(startColumn.taskIds);
  //     newTaskIds.splice(source.index, 1);
  //     newTaskIds.splice(destination.index, 0, draggableId);

  //     const newColumn = {
  //       ...startColumn,
  //       taskIds: newTaskIds,
  //     };

  //     const newState = {
  //       ...state,
  //       columns: {
  //         ...state.columns,
  //         [newColumn.id]: newColumn,
  //       },
  //     };

  //     setState(newState);
  //   } else {
  //     // Moving to a different column
  //     const startTaskIds = Array.from(startColumn.taskIds);
  //     startTaskIds.splice(source.index, 1);
  //     const newStartColumn = {
  //       ...startColumn,
  //       taskIds: startTaskIds,
  //     };

  //     const finishTaskIds = Array.from(finishColumn.taskIds);
  //     finishTaskIds.splice(destination.index, 0, draggableId);
  //     const newFinishColumn = {
  //       ...finishColumn,
  //       taskIds: finishTaskIds,
  //     };

  //     const newState = {
  //       ...state,
  //       columns: {
  //         ...state.columns,
  //         [newStartColumn.id]: newStartColumn,
  //         [newFinishColumn.id]: newFinishColumn,
  //       },
  //     };

  //     setState(newState);

  //     // this is the task status change api
  //     let reportData = {
  //       assignedTo: USER_ID,
  //       requestedLabel: taskDestinationStatus,
  //     };

  //     axios
  //       .put(
  //         `https://cc-api.codioticdemo.com/v1/task/change-label/${taskMongoId}`,
  //         reportData,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             "x-access-token": TOKEN,
  //           },
  //         }
  //       )
  //       .then((res) => {
  //         // if (res?.data?.status)
  //         if (res?.data?.data?.status) {
  //           console.log("res++++++++++++", res?.data?.status);
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   }
  // };

  const fetchData = (pageNum) => {
    const reportData = {
      limit: 20,
      searchValue: "",
      params: ["projectName"],
      page: pageNum,
      filterBy: [],
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
        console.log(
          "%c Data",
          "color:orange; font-size:18px; font-weight:800",
          response?.data?.data
        );

        // const findingColumnsStatus = response?.data?.data?.map((ele) => {
        //   return ele?.status;
        // });
        const findingColumnsStatus = [
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

        const uniqueColumns = Array.from(new Set(findingColumnsStatus));

        const findingTheTaskKeysWithStatus = uniqueColumns?.map((ele) => {
          const filteredTask = response?.data?.data?.filter(
            (filterTask) => filterTask.status === ele
          );

          // console.log("filterTaskfilterTask ############", filteredTask);

          const keysOfTaskNumber = filteredTask?.map(
            (taskNum) => "taks-" + taskNum?._id
          );

          return {
            title: ele,
            tasks: keysOfTaskNumber || [""],
          };
        });

        // console.log(
        //   "findingTheTaskKeysWithStatus",
        //   findingTheTaskKeysWithStatus
        // );

        // console.log(
        //   "%c FINAL TASK",
        //   "color:orange; font-size:18px; font-weight:800",
        //   findingTheTaskKeysWithStatus
        // );
        // console.log("uniqueColumns", uniqueColumns);

        const dummyData = {
          tasks: {},
          columnOrder: uniqueColumns?.map((_, ind) => `${_}-${ind + 1}`), //["column-1", "column-2", "column-3"],
          columns: {},
        };

        // get & set the columns with itrate column-1
        const columns = {};
        findingTheTaskKeysWithStatus.forEach((title, index) => {
          console.log("title", title);
          // const key = `column-${index + 1}`;
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
        response?.data?.data.forEach((task, index) => {
          const key = "taks-" + task?._id;
          tasks[key] = {
            id: key,
            content: task.title,
            taskNumber: task.taskNumber,
            _id: task._id,
          };
        });

        dummyData.tasks = tasks; // set the data in dummyData

        console.log("dummyData", dummyData);
        setState(dummyData);
      })
      .catch((error) => {
        console.error("Error submitting report:", error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTotalBoardsWidth = () => state.columnOrder.length * 366;

  return (
    <div
      ref={containerRef}
      className="flex gap-[20px] mt-[50px] ml-[50px] mr-[50px]"
      style={{
        // marginTop: "50px",
        // marginLeft: "50px",
        // marginRight: "50px",
        // display: "flex",
        // height: "850px",
        // gap: "20px",
        width: getTotalBoardsWidth(),
        overflowY: "auto",
        height: "85vh",
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        {state.columnOrder.map((columnId) => {
          const column = state.columns[columnId];
          return (
            <div
              key={column.id}
              className={`${
                !collapse
                  ? "w-[366px] overflow-auto"
                  : "w-[35px] overflow-hidden"
              } bg-[#fafafa] h-full  transition-all border-[#dbdbdb] border-[1px] rounded-[0.25rem]`}
              // style={{
              //   border: "1px solid #dbdbdb",
              //   borderRadius: "0.25rem",
              //   width: "366px",
              //   height: "100%",
              //   backgroundColor: "#fafafa",
              //   overflowY: "auto",
              // }}
            >
              <div
                className={`sticky top-0 flex gap-[5px] justify-between items-center bg-[#fafafa] text-[0.875rem] box-border leading-[1.2] text-[#303030] 
                           font-semibold mb-[10px] h-[50px] px-[0.5rem] ${
                             !collapse && "border-b-[#dbdbdb] border-b-[1px]"
                           }`}
                // style={{
                //   position: "sticky",
                //   top: 0,
                //   backgroundColor: "#fafafa",
                //   fontSize: "0.875rem",
                //   boxSizing: "border-box",
                //   lineHeight: 1.2,
                //   color: "#303030",
                //   fontWeight: 600,
                //   marginBottom: "10px",
                //   height: "50px",
                //   borderBottom: "1px solid #dbdbdb",
                //   paddingLeft: "0.5rem",
                //   paddingRight: "0.5rem",
                //   display: "flex",
                //   gap: 5,
                //   justifyContent: "space-between",
                //   alignItems: "center",
                // }}
              >
                <div
                  className="flex gap-[4px] items-center relative"
                  // style={{
                  //   display: "flex",
                  //   alignItems: "center",
                  //   gap: 8,
                  // }}
                >
                  <span
                    className={`transition-all hover:bg-gray-200 rounded flex-shrink-0 overflow-hidden cursor-pointer p-1 ${
                      collapse && "rotate-90 absolute left-[1px]"
                    }`}
                  >
                    <FaChevronRight
                      color="#666"
                      size={10}
                      onClick={() => setCollapse(!collapse)}
                      // style={{
                      //   flexShrink: 0,
                      //   overflow: "hidden",
                      //   overflowClipMargin: "content-box",
                      // }}
                    />
                  </span>
                  {/* Board Title Status */}

                  <span
                    className={`${
                      collapse && "rotate-90 absolute top-10 -left-[9px] inline"
                    }`}
                  >
                    {column.title}
                    {/* {column.title?.replaceAll("_", " ")} */}
                  </span>
                </div>

                {/* Board Tasks Status Count */}
                {!collapse && column.taskIds.length ? (
                  <div
                    className="bg-[#000000] text-[#fafafa] rounded-[8px] p-[5px]"
                    // style={{
                    //   backgroundColor: "#000000",
                    //   color: "#fafafa",
                    //   borderRadius: "8px",
                    //   padding: "5px",
                    // }}
                  >
                    {column.taskIds.length}
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
                              {!collapse ? (
                                <div
                                  className="mt-0 mb-[10px] mx-[10px] w-auto overflow-hidden p-[1rem] cursor-grab rounded-[0.25rem] 
                                         bg-[#fff] text-[14px] text-[#303030] font-semibold border-[0.5px] border-[#dbdbdb]"
                                  // style={{
                                  //   margin: "0px 10px 10px 10px",
                                  //   width: "auto",
                                  //   overflow: "hidden",
                                  //   padding: "1rem",
                                  //   cursor: "grab",
                                  //   borderRadius: "0.25rem",
                                  //   backgroundColor: "#fff",
                                  //   fontSize: "14px",
                                  //   color: "#303030",
                                  //   fontWeight: 600,
                                  //   border: "0.5px solid #dbdbdb",
                                  // }}
                                >
                                  {task.content}
                                  <div>
                                    <span
                                      className="leading-[10px] text-[#666] whitespace-normal box-border font-normal text-[12px]"
                                      // style={{
                                      //   lineHeight: "10px",
                                      //   color: "#666",
                                      //   boxSizing: "border-box",
                                      //   whiteSpace: "normal",
                                      //   fontWeight: 400,
                                      //   tabSize: 8,
                                      //   fontSize: "12px"
                                      // }}
                                    >
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
