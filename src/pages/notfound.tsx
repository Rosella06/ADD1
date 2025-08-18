import { Link } from 'react-router-dom';

function Notfound() {
    return (
        <div className="flex items-center justify-center h-screen bg-blue-100">
            <div className="card bg-blue-500 text-white w-[550px] shadow-lg rounded-lg">
                <div className="card-body items-center text-center">
                    <h2 className="card-title text-9xl font-bold">404!</h2>
                    <h2 className="card-title text-4xl mt-4">ไม่พบหน้าที่คุณต้องการ</h2>
                    <p className="text-lg mt-1">แนะนำให้กลับไปหน้าแรกเพื่อดำเนินงานตามปกติ</p>
                    <Link to="/" className="btn btn-outline mt-5 text-white  hover:bg-blue-600 hover:border-blue-600 hover:text-white">
                        กลับไปหน้าแรก
                    </Link>
                    <i className="fa-regular fa-face-sad-tear text-5xl mt-4"></i>
                </div>
            </div>
        </div>
    );
}

export default Notfound;
