import './admintop.css'
import { useNavigate } from 'react-router-dom';

function AdminTop({ title }) {

    const navigate = useNavigate();

    return (
        <div className='adminPageTopBox'>
            <div className="adminPageTitle">{title}</div>
            <button onClick={() => navigate('/')}>나가기</button>
        </div>
    )

}

export default AdminTop;