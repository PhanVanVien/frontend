import React, { useEffect, useState } from "react";
import styles from "./ManageRooms.module.css";
import "./style.css";
import { FaPlus } from "react-icons/fa";
import {
  addNewRoom,
  deleteRoom,
  editRoom,
  getAllRoomsByPageAndLimit,
} from "../../Utils/ApiFunctions";
import { MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import Modal from "./Modal/Modal";
import ModalConfirmation from "./Modal/ModalConfirmation/ModalConfirmation";
import ReactPaginate from "react-paginate";

const ManageRooms = () => {
  const [titleModal, setTitleModal] = useState("");
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [id, setId] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [limit, setLimit] = useState(8);
  const [totalRecords, setTotalRecords] = useState();
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, deleteRoom]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getAllRoomsByPageAndLimit(currentPage, limit);
      setRooms(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (title, room) => {
    setTitleModal(title);
    setSelectedRoom(room);
    setIsEditing(!!room);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeConfirmation = () => {
    setIsConfirm(false);
  };

  const openConfirm = (id) => {
    setIsConfirm(true);
    setId(id);
  };

  const handleDelete = async () => {
    try {
      const result = await deleteRoom(id);
      if (result.statusCode === 200) {
        fetchData();
        toast.success(`Delete room ${id} successful`);
      } else {
        toast.error(`${result.message}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmit = async (room) => {
    try {
      if (isEditing) {
        const response = await editRoom(room.roomId, room);
        if (response !== undefined) {
          toast.success(`Successfully update room ${room.roomId}`);
          closeModal();
          fetchData();
        } else {
          toast.error("Update room failed");
        }
      } else {
        const response = await addNewRoom(room);
        if (response !== undefined) {
          toast.success("Add room successful");
          closeModal();
          fetchData();
        } else {
          toast.error("Add room failed");
        }
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <>
      <Modal
        isModalOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onSubmit}
        title={titleModal}
        room={selectedRoom}
        isEditing={isEditing}
      />
      <ModalConfirmation
        isConfirm={isConfirm}
        onClose={closeConfirmation}
        onSubmit={handleDelete}
      />
      <button className={styles.addbtn} onClick={() => openModal("Add Room")}>
        <FaPlus size={16} style={{ marginRight: "5px" }} />
        <span>Add Room</span>
      </button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>View</th>
            <th>Adults</th>
            <th>Children</th>
            <th>Price ($)</th>
            <th>
              Area (m<sup>2</sup>)
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((item) => (
            <tr key={item.roomId}>
              <td style={{ fontWeight: "bold" }}>{item.roomId}</td>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.view}</td>
              <td>{item.adult}</td>
              <td>{item.child}</td>
              <td>{item.price}</td>
              <td>{item.area}</td>
              <td style={{ display: "flex", justifyContent: "center" }}>
                <button
                  className={`${styles.actionbtn} ${styles.edit}`}
                  style={{ marginRight: "5px" }}
                >
                  <MdModeEdit
                    size={20}
                    onClick={() => openModal("Edit Room", item)}
                  />
                </button>
                <button className={`${styles.actionbtn} ${styles.delete}`}>
                  <MdDelete
                    size={20}
                    onClick={() => openConfirm(item.roomId)}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={(e) => handlePageClick(e)}
          pageRangeDisplayed={5}
          pageCount={totalPages}
          previousLabel="<"
          renderOnZeroPageCount={null}
          className={styles.paginate}
          containerClassName={"pagination"}
          pageClassName={"page-item"}
          activeClassName={"activePage"}
        />
      )}
    </>
  );
};

export default ManageRooms;
